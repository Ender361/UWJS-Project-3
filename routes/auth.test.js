import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockFindOne = jest.fn();
const mockFindById = jest.fn();

const MockUser = jest.fn().mockImplementation(function MockUser(data) {
	Object.assign(this, data, { _id: 'user-id-123' });
	this.setPassword = jest.fn((password) => {
		this.passwordHash = `hashed:${password}`;
		this.passwordSalt = 'salt';
	});
	this.save = jest.fn().mockResolvedValue(this);
});

MockUser.findOne = mockFindOne;
MockUser.findById = mockFindById;

await jest.unstable_mockModule('../models/userModel.js', () => ({
	default: MockUser,
}));

const { default: authRouter } = await import('./auth.js');

function createMockRes() {
	const res = {};
	res.status = jest.fn().mockImplementation(() => res);
	res.json = jest.fn().mockImplementation(() => res);
	return res;
}

function getHandler(router, method, path) {
	const layer = router.stack.find(
		(entry) => entry.route?.path === path && entry.route.methods[method],
	);
	if (!layer) {
		throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
	}
	return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('auth routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('rejects registration without required fields', async () => {
		const handler = getHandler(authRouter, 'post', '/register');
		const req = { body: { email: 'a@example.com' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('registers a new user and returns a token', async () => {
		mockFindOne.mockResolvedValue(null);
		const handler = getHandler(authRouter, 'post', '/register');
		const req = {
			body: {
				name: 'Timmy',
				email: 'timmy@example.com',
				password: 'password123',
				role: 'admin',
			},
		};
		const res = createMockRes();

		await handler(req, res);

		expect(MockUser).toHaveBeenCalledWith({
			name: 'Timmy',
			email: 'timmy@example.com',
			role: 'admin',
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json.mock.calls[0][0].token).toBeTruthy();
		expect(res.json.mock.calls[0][0].user.email).toBe('timmy@example.com');
	});

	it('rejects duplicate registration', async () => {
		mockFindOne.mockResolvedValue({ _id: 'existing' });
		const handler = getHandler(authRouter, 'post', '/register');
		const req = {
			body: {
				name: 'Timmy',
				email: 'timmy@example.com',
				password: 'password123',
			},
		};
		const res = createMockRes();

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(409);
	});

	it('rejects login without credentials', async () => {
		const handler = getHandler(authRouter, 'post', '/login');
		const req = { body: { email: 'timmy@example.com' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('rejects invalid login credentials', async () => {
		mockFindOne.mockResolvedValue({ verifyPassword: jest.fn().mockReturnValue(false) });
		const handler = getHandler(authRouter, 'post', '/login');
		const req = { body: { email: 'timmy@example.com', password: 'wrong' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
	});

	it('logs in a valid user and returns a token', async () => {
		mockFindOne.mockResolvedValue({
			_id: 'user-id-123',
			name: 'Timmy',
			email: 'timmy@example.com',
			role: 'admin',
			verifyPassword: jest.fn().mockReturnValue(true),
		});
		const handler = getHandler(authRouter, 'post', '/login');
		const req = { body: { email: 'timmy@example.com', password: 'password123' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.status).not.toHaveBeenCalledWith(401);
		expect(res.json.mock.calls[0][0].token).toBeTruthy();
	});

	it('returns current user from /me', async () => {
		const handler = getHandler(authRouter, 'get', '/me');
		const req = { user: { _id: 'u1', role: 'user' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.json.mock.calls[0][0].user._id).toBe('u1');
	});

	it('returns admin check response from /admin-check', async () => {
		const handler = getHandler(authRouter, 'get', '/admin-check');
		const req = { user: { _id: 'a1', role: 'admin' } };
		const res = createMockRes();

		await handler(req, res);

		expect(res.json.mock.calls[0][0].message).toContain('Admin access confirmed');
	});
});