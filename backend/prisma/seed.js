require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD_HASH_ROUNDS = 12;

async function hash(password) {
    return await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

async function main() {
    console.log('--- Starting Database Seeding ---');

    // 1. Roles (Keep standard roles so role table works)
    const rolesList = ['owner', 'admin', 'branch_manager', 'cashier'];
    const roleMap = {};
    for (const r of rolesList) {
        const role = await prisma.roles.upsert({
            where: { role_name: r },
            update: {},
            create: { role_name: r }
        });
        roleMap[r] = role.roleID;
    }
    console.log('Seeded Roles:', Object.keys(roleMap));

    // 2. Exactly 1 Branch
    const branchesData = [
        {
            branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
            name: 'Main Branch (Tagbilaran)',
            address: 'CPG Avenue, Tagbilaran City, Bohol'
        }
    ];

    const branchMap = {};
    for (const b of branchesData) {
        const branch = await prisma.branch.upsert({
            where: { branchID: b.branchID },
            update: { name: b.name, address: b.address },
            create: b
        });
        branchMap[b.name] = branch.branchID;
    }
    console.log('Seeded Branch:', Object.keys(branchMap));

    // 3. Exactly 1 Supplier
    const suppliersData = [
        {
            supplierID: 'd1111111-1111-1111-1111-111111111111',
            name: 'Nike Philippines Logistics & Distribution',
            contact_info: 'b2b-orders@nikeph.com | +63 2 8845 2200'
        }
    ];

    for (const s of suppliersData) {
        await prisma.suppliers.upsert({
            where: { supplierID: s.supplierID },
            update: { name: s.name, contact_info: s.contact_info },
            create: s
        });
    }
    console.log('Seeded Supplier');

    // 4. Exactly 1 Product
    const productsData = [
        {
            productID: 'c1a01111-1111-4111-a111-111111111111',
            sku: 'NK-AJ1-CHI-105',
            name: 'Nike Air Jordan 1 Retro High Chicago (US 10.5)',
            unit_cost: 4800.00,
            unit_price: 9895.00
        }
    ];

    for (const p of productsData) {
        const product = await prisma.products.upsert({
            where: { sku: p.sku },
            update: {
                name: p.name,
                unit_cost: p.unit_cost,
                unit_price: p.unit_price
            },
            create: p
        });
        p.productID = product.productID;
    }
    console.log('Seeded Product');

    // 5. Exactly 1 Inventory for the 1 Branch
    for (const b of branchesData) {
        for (const p of productsData) {
            await prisma.inventory.upsert({
                where: {
                    productID_branchID: {
                        productID: p.productID,
                        branchID: b.branchID
                    }
                },
                update: {},
                create: {
                    productID: p.productID,
                    branchID: b.branchID,
                    quantity: 24,
                    reorder_threshold: 8
                }
            });
        }
    }
    console.log('Seeded Inventory');

    // 6. Exactly 1 User / Account (Store Owner)
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedPassword) {
        throw new Error('SEED_ADMIN_PASSWORD must be set in backend/.env');
    }
    const hashedAdminPw = await hash(seedPassword);

    const usersToSeed = [
        {
            firstName: 'Eleanor',
            middleName: 'M',
            lastName: 'Vance',
            email: 'admin@stockwearkicks.com',
            password_hash: hashedAdminPw,
            roleID: roleMap['owner'],
            branchID: null
        }
    ];

    for (const u of usersToSeed) {
        await prisma.users.upsert({
            where: { email: u.email },
            update: {
                firstName: u.firstName,
                middleName: u.middleName,
                lastName: u.lastName,
                password_hash: u.password_hash,
                roleID: u.roleID,
                branchID: u.branchID
            },
            create: u
        });
    }

    console.log('Seeded 1 Owner User into Database successfully!');
    console.log('--- Database Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
