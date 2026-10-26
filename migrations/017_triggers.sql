-- =============================================================
-- 017_triggers.sql
-- Database Triggers for StockWear-Kicks
--
-- Triggers included:
--  1. trg_sale_item_deduct_inventory
--       ? On INSERT into sale_items: deduct qty from inventory,
--         raise an error if insufficient stock.
--  2. trg_sale_total_update
--       ? On INSERT/UPDATE/DELETE on sale_items: recalculate
--         total_amount on the parent sales row.
--  3. trg_delivery_item_add_inventory
--       ? On INSERT into delivery_item: add received qty to
--         inventory (upsert), and log a stock_movement row.
--  4. trg_sale_log_stock_movement
--       ? On INSERT into sale_items: log a negative
--         stock_movement row (reason = 'sale').
--  5. trg_inventory_updated_at
--       ? On UPDATE of inventory: refresh updated_at timestamp.
--  6. trg_auto_restock_request
--       ? After inventory update: if quantity drops at or below
--         reorder_threshold, auto-insert a 'pending' restock
--         request (skip if one already exists).
-- =============================================================

-- ------------------------------------------------------------
-- TRIGGER 1 & 4 — Sale item: deduct inventory + log movement
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sale_item_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_branch    UUID;
  v_current   INT;
BEGIN
  -- Resolve branch from parent sale
  SELECT "branchID" INTO v_branch
    FROM sales WHERE "saleID" = NEW."saleID";

  -- Check & deduct inventory
  SELECT quantity INTO v_current
    FROM inventory
   WHERE "productID" = NEW."productID"
     AND "branchID"  = v_branch;

  IF v_current IS NULL THEN
    RAISE EXCEPTION
      'Product % not found in inventory for branch %',
      NEW."productID", v_branch;
  END IF;

  IF v_current < NEW.quantity THEN
    RAISE EXCEPTION
      'Insufficient stock for product %. Available: %, requested: %',
      NEW."productID", v_current, NEW.quantity;
  END IF;

  UPDATE inventory
     SET quantity   = quantity - NEW.quantity,
         updated_at = now()
   WHERE "productID" = NEW."productID"
     AND "branchID"  = v_branch;

  -- Log stock movement (negative = outbound sale)
  INSERT INTO stock_movements
    ("productID","branchID",change_qty,reference_id,reason,created_at)
  VALUES
    (NEW."productID", v_branch, -NEW.quantity, NEW."saleID", 'sale', now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sale_item_after_insert ON sale_items;
CREATE TRIGGER trg_sale_item_after_insert
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION fn_sale_item_after_insert();

-- ------------------------------------------------------------
-- TRIGGER 2 — Recalculate sales.total_amount
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_recalculate_sale_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_sale_id UUID;
BEGIN
  -- Determine which saleID was affected
  IF TG_OP = 'DELETE' THEN
    v_sale_id := OLD."saleID";
  ELSE
    v_sale_id := NEW."saleID";
  END IF;

  UPDATE sales
     SET total_amount = (
           SELECT COALESCE(SUM(quantity * unit_price), 0)
             FROM sale_items
            WHERE "saleID" = v_sale_id
         )
   WHERE "saleID" = v_sale_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_sale_total_update ON sale_items;
CREATE TRIGGER trg_sale_total_update
  AFTER INSERT OR UPDATE OR DELETE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION fn_recalculate_sale_total();

-- ------------------------------------------------------------
-- TRIGGER 3 — Delivery item: add inventory + log movement
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_delivery_item_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_branch UUID;
BEGIN
  -- Resolve branch from parent delivery
  SELECT "branchID" INTO v_branch
    FROM deliveries WHERE "deliveryID" = NEW."deliveryID";

  -- Upsert inventory
  INSERT INTO inventory ("productID","branchID",quantity,reorder_threshold,updated_at)
  VALUES (NEW."productID", v_branch, NEW.quantity_received, 0, now())
  ON CONFLICT ("productID","branchID")
  DO UPDATE SET
    quantity   = inventory.quantity + EXCLUDED.quantity,
    updated_at = now();

  -- Log stock movement (positive = inbound delivery)
  INSERT INTO stock_movements
    ("productID","branchID",change_qty,reference_id,reason,created_at)
  VALUES
    (NEW."productID", v_branch, NEW.quantity_received, NEW."deliveryID", 'delivery', now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_delivery_item_after_insert ON delivery_item;
CREATE TRIGGER trg_delivery_item_after_insert
  AFTER INSERT ON delivery_item
  FOR EACH ROW EXECUTE FUNCTION fn_delivery_item_after_insert();

-- ------------------------------------------------------------
-- TRIGGER 5 — Refresh inventory.updated_at on every UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_inventory_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION fn_inventory_set_updated_at();

-- ------------------------------------------------------------
-- TRIGGER 6 — Auto-create restock_request when stock is low
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_auto_restock_request()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_exists INT;
BEGIN
  -- Only fire when quantity has dropped to or below threshold
  IF NEW.quantity > NEW.reorder_threshold THEN
    RETURN NEW;
  END IF;

  -- Skip if a pending or approved request already exists for this product+branch
  SELECT COUNT(*) INTO v_exists
    FROM restock_requests
   WHERE "productID" = NEW."productID"
     AND "branchID"  = NEW."branchID"
     AND status IN ('pending','approved');

  IF v_exists = 0 THEN
    INSERT INTO restock_requests
      ("productID","branchID",request_qty,status,created_at)
    VALUES
      (NEW."productID", NEW."branchID",
       GREATEST(NEW.reorder_threshold * 2 - NEW.quantity, 1),
       'pending',
       now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_restock_request ON inventory;
CREATE TRIGGER trg_auto_restock_request
  AFTER UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION fn_auto_restock_request();
