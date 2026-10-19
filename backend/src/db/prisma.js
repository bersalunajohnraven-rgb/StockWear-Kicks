require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { getDatabaseContext } = require('./databaseContext');

const basePrisma = new PrismaClient({
    omit: {
        users: {
            password_hash: true
        }
    }
});

const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const context = getDatabaseContext();

                if (!context) {
                    return query(args);
                }

                return basePrisma.$transaction(async (transaction) => {
                    await transaction.$queryRaw`
                        SELECT
                            set_config('app.user_id', ${context.userID}, true),
                            set_config('app.role', ${context.roleName}, true),
                            set_config('app.branch_id', ${context.branchID || ''}, true)
                    `;

                    const modelName = model[0].toLowerCase() + model.slice(1);
                    const delegate = transaction[modelName];

                    if (!delegate || typeof delegate[operation] !== 'function') {
                        throw new Error(`Unsupported Prisma operation: ${model}.${operation}`);
                    }

                    return delegate[operation](args);
                }, {
                    maxWait: 20000,
                    timeout: 30000
                });
            }
        }
    }
});

module.exports = prisma;
