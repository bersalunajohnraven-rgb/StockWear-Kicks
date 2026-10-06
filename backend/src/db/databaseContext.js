const { AsyncLocalStorage } = require('node:async_hooks');

const databaseContext = new AsyncLocalStorage();

const runWithDatabaseContext = (context, callback) => {
    return databaseContext.run(context, callback);
};

const getDatabaseContext = () => databaseContext.getStore();

module.exports = {
    getDatabaseContext,
    runWithDatabaseContext
};
