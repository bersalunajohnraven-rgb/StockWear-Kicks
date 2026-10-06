const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../src/middleware/authMiddleware');
const { getDatabaseContext } = require('../src/db/databaseContext');

const secret = 'test-only-secret-that-is-at-least-32-bytes';
const userID = '095c11f4-30b9-42c5-b344-30e736cc9a01';
const branchID = '8677bc42-0c31-4d31-b861-5cda5f69c6d4';
process.env.JWT_SECRET = secret;

const request = (authorization, headers = {}) => ({
    header(name) {
        return headers[name] || (name === 'authorization' ? authorization : undefined);
    }
});

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

const createToken = (claims, options = {}) => jwt.sign(claims, secret, {
    algorithm: 'HS256',
    audience: 'stockline-api',
    expiresIn: '1m',
    issuer: 'stockline-api',
    subject: userID,
    ...options
});

test('rejects caller-provided user IDs without a bearer token', () => {
    const res = response();
    let nextCalled = false;

    authenticateUser(request(undefined, { 'x-user-id': userID }), res, () => {
        nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
});

test('sets identity and branch context from a verified bearer token', () => {
    const token = createToken({ roleName: 'branch_manager', branchID });
    const req = request(`Bearer ${token}`);
    const res = response();
    let nextCalled = false;

    authenticateUser(req, res, () => {
        nextCalled = true;
        assert.equal(getDatabaseContext().userID, userID);
        assert.equal(getDatabaseContext().branchID, branchID);
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.roles.role_name, 'branch_manager');
});

test('rejects expired or invalidly scoped tokens', () => {
    const expiredToken = createToken(
        { roleName: 'admin', branchID: null },
        { expiresIn: -1 }
    );
    const expiredResponse = response();
    authenticateUser(request(`Bearer ${expiredToken}`), expiredResponse, () => {
        assert.fail('expired tokens must not authenticate');
    });
    assert.equal(expiredResponse.statusCode, 401);

    const unscopedBranchManager = createToken({
        roleName: 'branch_manager',
        branchID: null
    });
    const unscopedResponse = response();
    authenticateUser(request(`Bearer ${unscopedBranchManager}`), unscopedResponse, () => {
        assert.fail('branch managers must have a branch assignment');
    });
    assert.equal(unscopedResponse.statusCode, 401);
});
