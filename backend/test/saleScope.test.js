const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getSalesScope } = require('../src/services/saleService');

const branchID = '8677bc42-0c31-4d31-b861-5cda5f69c6d4';

test('branch managers can only query their assigned branch', () => {
    assert.deepEqual(
        getSalesScope({
            branchID,
            userID: '095c11f4-30b9-42c5-b344-30e736cc9a01',
            roles: { role_name: 'branch_manager' }
        }),
        { branchID }
    );
});

test('cashiers can only query their own branch sales', () => {
    const userID = '095c11f4-30b9-42c5-b344-30e736cc9a01';

    assert.deepEqual(
        getSalesScope({
            branchID,
            userID,
            roles: { role_name: 'cashier' }
        }),
        { branchID, cashierID: userID }
    );
});

test('owners and admins retain global sales access', () => {
    assert.deepEqual(
        getSalesScope({
            branchID: null,
            userID: '095c11f4-30b9-42c5-b344-30e736cc9a01',
            roles: { role_name: 'admin' }
        }),
        {}
    );
});
