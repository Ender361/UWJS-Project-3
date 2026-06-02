import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockFindById = jest.fn();
const mockVerifyToken = jest.fn();

await jest.unstable_mockModule('../models/userModel.js', () => ({
	default: {
		findById: mockFindById,
	},
}));

await jest.unstable_mockModule('../utils/auth.js', () => ({
	verifyToken: mockVerifyToken,
}));

const { authRequired, adminOnly } = await import('./auth.js');

function createMockRes() {
	const res = {};
	res.status = jest.fn().mockImplementation(() => res);
	res.json = jest.fn().mockImplementation(() => res);
	return res;
}

describe('auth middleware', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('rejects requests without an authorization header', async () => {
		const req = { get: jest.fn().mockReturnValue(undefined) };
		const res = createMockRes();
		const next = jest.fn();

		await authRequired(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Missing authorization token' });
		expect(next).not.toHaveBeenCalled();
	});

	it('rejects invalid tokens', async () => {
		const req = { get: jest.fn().mockReturnValue('Bearer bad-token') };
		const res = createMockRes();
		const next = jest.fn();
		mockVerifyToken.mockImplementation(() => {
			throw new Error('bad token');
		});

		await authRequired(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
		expect(next).not.toHaveBeenCalled();
	});

	it('attaches the user and calls next for a valid token', async () => {
		const user = { _id: 'abc123', role: 'admin' };
		const req = { get: jest.fn().mockReturnValue('Bearer token-value') };
		const res = createMockRes();
		const next = jest.fn();

		mockVerifyToken.mockReturnValue({ userId: 'abc123' });
		mockFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue(user),
		});

		await authRequired(req, res, next);

		expect(req.user).toEqual(user);
		expect(next).toHaveBeenCalled();
	});

	it('blocks non-admin users from adminOnly', () => {
		const req = { user: { role: 'user' } };
		const res = createMockRes();
		const next = jest.fn();

		adminOnly(req, res, next);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
		expect(next).not.toHaveBeenCalled();
	});

	it('allows admin users through adminOnly', () => {
		const req = { user: { role: 'admin' } };
		const res = createMockRes();
		const next = jest.fn();

		adminOnly(req, res, next);

		expect(next).toHaveBeenCalled();
	});
});