const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authorizeRoles } = require('../src/middleware/roleMiddleware');

const secret = 'test-only-secret-that-is-at-least-32-bytes';
const userID = '095c11f4-30b9-42c5-b344-30e736cc9a01';
process.env.JWT_SECRET = secret;

const response = () => ({
    statusCode: null,
    body: null,
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

test('audit log route authorizes owner and admin but rejects cashier and manager', () => {
    const middleware = authorizeRoles('owner', 'admin');

    // Admin allowed
    let adminPassed = false;
    middleware({ user: { userID, roles: { role_name: 'admin' } } }, response(), () => {
        adminPassed = true;
    });
    assert.equal(adminPassed, true);

    // Owner allowed
    let ownerPassed = false;
    middleware({ user: { userID, roles: { role_name: 'owner' } } }, response(), () => {
        ownerPassed = true;
    });
    assert.equal(ownerPassed, true);

    // Cashier rejected
    const cashierRes = response();
    let cashierPassed = false;
    middleware({ user: { userID, roles: { role_name: 'cashier' } } }, cashierRes, () => {
        cashierPassed = true;
    });
    assert.equal(cashierPassed, false);
    assert.equal(cashierRes.statusCode, 403);

    // Branch manager rejected
    const managerRes = response();
    let managerPassed = false;
    middleware({ user: { userID, roles: { role_name: 'branch_manager' } } }, managerRes, () => {
        managerPassed = true;
    });
    assert.equal(managerPassed, false);
    assert.equal(managerRes.statusCode, 403);
});
