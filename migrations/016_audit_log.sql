-- 016_audit_log.sql
-- Idempotent migration: Generic row-level audit logging for sensitive tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    audit_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name      TEXT NOT NULL,
    record_id       TEXT NOT NULL,
    action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_fields  TEXT[],
    old_data        JSONB,
    new_data        JSONB,
    changed_by      TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record
    ON public.audit_log (table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at
    ON public.audit_log (changed_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by
    ON public.audit_log (changed_by);

-- 3. Generic PL/pgSQL audit trigger function
CREATE OR REPLACE FUNCTION public.fn_audit_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_table_name TEXT := TG_TABLE_NAME;
    v_record_id TEXT := NULL;
    v_pk_col TEXT := NULL;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_changed_fields TEXT[] := ARRAY[]::TEXT[];
    v_changed_by TEXT;
    v_key TEXT;
    v_old_val JSONB;
    v_new_val JSONB;
BEGIN
    -- Read actor from app.current_user_id, falling back to app.user_id, then current_user
    v_changed_by := NULLIF(current_setting('app.current_user_id', true), '');
    IF v_changed_by IS NULL THEN
        v_changed_by := NULLIF(current_setting('app.user_id', true), '');
    END IF;
    IF v_changed_by IS NULL THEN
        v_changed_by := current_user;
    END IF;

    -- Automatically discover table primary key column
    SELECT a.attname
    INTO v_pk_col
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = TG_RELID AND i.indisprimary
    ORDER BY a.attnum
    LIMIT 1;

    IF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);

        IF v_pk_col IS NOT NULL THEN
            v_record_id := v_new_data ->> v_pk_col;
        END IF;
        IF v_record_id IS NULL THEN
            v_record_id := COALESCE(
                v_new_data ->> 'userID',
                v_new_data ->> 'roleID',
                v_new_data ->> 'productID',
                v_new_data ->> 'branchID',
                v_new_data ->> 'supplierID',
                v_new_data ->> 'orderID',
                v_new_data ->> 'id'
            );
        END IF;

        -- Record all inserted columns in changed_fields
        SELECT array_agg(k ORDER BY k)
        INTO v_changed_fields
        FROM jsonb_object_keys(v_new_data) AS k;

        -- Redact password and token columns from new_data
        FOR v_key IN SELECT jsonb_object_keys(v_new_data) LOOP
            IF v_key ILIKE '%password%' OR v_key ILIKE '%token%' THEN
                v_new_data := v_new_data - v_key;
            END IF;
        END LOOP;

    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);

        IF v_pk_col IS NOT NULL THEN
            v_record_id := v_old_data ->> v_pk_col;
        END IF;
        IF v_record_id IS NULL THEN
            v_record_id := COALESCE(
                v_old_data ->> 'userID',
                v_old_data ->> 'roleID',
                v_old_data ->> 'productID',
                v_old_data ->> 'branchID',
                v_old_data ->> 'supplierID',
                v_old_data ->> 'orderID',
                v_old_data ->> 'id'
            );
        END IF;

        SELECT array_agg(k ORDER BY k)
        INTO v_changed_fields
        FROM jsonb_object_keys(v_old_data) AS k;

        -- Redact password and token columns from old_data
        FOR v_key IN SELECT jsonb_object_keys(v_old_data) LOOP
            IF v_key ILIKE '%password%' OR v_key ILIKE '%token%' THEN
                v_old_data := v_old_data - v_key;
            END IF;
        END LOOP;

    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);

        IF v_pk_col IS NOT NULL THEN
            v_record_id := v_new_data ->> v_pk_col;
        END IF;
        IF v_record_id IS NULL THEN
            v_record_id := COALESCE(
                v_new_data ->> 'userID',
                v_new_data ->> 'roleID',
                v_new_data ->> 'productID',
                v_new_data ->> 'branchID',
                v_new_data ->> 'supplierID',
                v_new_data ->> 'orderID',
                v_new_data ->> 'id'
            );
        END IF;

        -- Detect actual field differences
        FOR v_key IN SELECT jsonb_object_keys(v_new_data) LOOP
            v_old_val := v_old_data -> v_key;
            v_new_val := v_new_data -> v_key;
            IF v_old_val IS DISTINCT FROM v_new_val THEN
                v_changed_fields := array_append(v_changed_fields, v_key);
            END IF;
        END LOOP;

        -- Do not log UPDATEs where nothing changed
        IF v_changed_fields IS NULL OR array_length(v_changed_fields, 1) IS NULL OR array_length(v_changed_fields, 1) = 0 THEN
            RETURN NEW;
        END IF;

        -- Redact password and token columns from old_data and new_data
        FOR v_key IN SELECT jsonb_object_keys(v_new_data) LOOP
            IF v_key ILIKE '%password%' OR v_key ILIKE '%token%' THEN
                v_new_data := v_new_data - v_key;
            END IF;
        END LOOP;
        FOR v_key IN SELECT jsonb_object_keys(v_old_data) LOOP
            IF v_key ILIKE '%password%' OR v_key ILIKE '%token%' THEN
                v_old_data := v_old_data - v_key;
            END IF;
        END LOOP;
    END IF;

    -- Append audit entry
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        changed_fields,
        old_data,
        new_data,
        changed_by,
        changed_at
    ) VALUES (
        v_table_name,
        COALESCE(v_record_id, 'UNKNOWN'),
        TG_OP,
        v_changed_fields,
        v_old_data,
        v_new_data,
        v_changed_by,
        now()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- 4. AFTER INSERT OR UPDATE OR DELETE row triggers on sensitive tables
DO $$
DECLARE
    t TEXT;
    tbls TEXT[] := ARRAY['users', 'roles', 'branch', 'branches', 'products', 'suppliers', 'purchase_orders'];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I', t, t);
            EXECUTE format(
                'CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change()',
                t, t
            );
        END IF;
    END LOOP;
END;
$$;

-- 5. Append-only enforcement: block UPDATE and DELETE on audit_log
CREATE OR REPLACE FUNCTION public.fn_audit_log_prevent_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only: % operations are prohibited', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_prevent_modification ON public.audit_log;
CREATE TRIGGER trg_audit_log_prevent_modification
    BEFORE UPDATE OR DELETE ON public.audit_log
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_log_prevent_modification();

-- 6. Enable Row Level Security and configure stockline_app permissions
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'stockline_app') THEN
        GRANT SELECT ON public.audit_log TO stockline_app;
        REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM stockline_app;

        DROP POLICY IF EXISTS stockline_audit_log_read ON public.audit_log;
        CREATE POLICY stockline_audit_log_read ON public.audit_log
            FOR SELECT TO stockline_app
            USING (current_setting('app.role', true) IN ('owner', 'admin'));
    END IF;
END;
$$;
