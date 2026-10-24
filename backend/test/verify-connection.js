const prisma = require('../src/db/prisma');

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const [identity] = await prisma.$queryRaw`
            SELECT current_database(), current_user, inet_server_addr()
        `;
        console.log('Connected to database:', identity.current_database, 'as user:', identity.current_user);

        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        console.log('Public tables found:', tables.map(t => t.table_name).join(', '));

        const branchCount = await prisma.branch.count();
        const productCount = await prisma.products.count();
        const userCount = await prisma.users.count();
        console.log(`Counts -> Branches: ${branchCount}, Products: ${productCount}, Users: ${userCount}`);
        console.log('Connection and read operations verified successfully!');
    } catch (error) {
        console.error('Connection test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
