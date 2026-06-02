import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

const MockMenuItem = {
	find: mockFind,
	findById: mockFindById,
	create: mockCreate,
	findByIdAndUpdate: mockFindByIdAndUpdate,
	findByIdAndDelete: mockFindByIdAndDelete,
};

await jest.unstable_mockModule('../models/menuItemModel.js', () => ({
	default: MockMenuItem,
}));

await jest.unstable_mockModule('../middleware/auth.js', () => ({
	authRequired: (_req, _res, next) => next(),
	adminOnly: (_req, _res, next) => next(),
}));

const { default: menuRouter } = await import('./menu.js');

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

describe('menu routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('lists all menu items', async () => {
		mockFind.mockReturnValue({
			sort: jest.fn().mockReturnValue({
				lean: jest.fn().mockResolvedValue([{ name: 'Latte' }]),
			}),
		});

		const handler = getHandler(menuRouter, 'get', '/');
		const res = createMockRes();

		await handler({ query: {} }, res);

		expect(res.json.mock.calls[0][0].items).toHaveLength(1);
	});

	it('searches menu items when q is provided', async () => {
		mockFind.mockReturnValue({
			sort: jest.fn().mockReturnValue({
				lean: jest.fn().mockResolvedValue([{ name: 'Mocha' }]),
			}),
		});

		const handler = getHandler(menuRouter, 'get', '/search');
		const res = createMockRes();

		await handler({ query: { q: 'mocha' } }, res);

		expect(mockFind).toHaveBeenCalled();
		expect(res.json.mock.calls[0][0].items[0].name).toBe('Mocha');
	});

	it('returns a menu item by id', async () => {
		mockFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue({ name: 'Latte' }),
		});
		const handler = getHandler(menuRouter, 'get', '/:id');
		const res = createMockRes();

		await handler({ params: { id: '123' } }, res);

		expect(res.json.mock.calls[0][0].item.name).toBe('Latte');
	});

	it('returns 404 when a menu item is missing', async () => {
		mockFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue(null),
		});
		const handler = getHandler(menuRouter, 'get', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('rejects invalid create payloads', async () => {
		const handler = getHandler(menuRouter, 'post', '/');
		const res = createMockRes();

		await handler({ body: { price: 5 } }, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('creates a menu item', async () => {
		mockCreate.mockResolvedValue({ _id: '1', name: 'Latte' });
		const handler = getHandler(menuRouter, 'post', '/');
		const res = createMockRes();

		await handler({ body: { name: 'Latte', price: 5 } }, res);

		expect(mockCreate).toHaveBeenCalledWith({
			name: 'Latte',
			description: '',
			price: 5,
			category: 'coffee',
			available: true,
		});
		expect(res.status).toHaveBeenCalledWith(201);
	});

	it('updates a menu item', async () => {
		mockFindByIdAndUpdate.mockReturnValue({
			lean: jest.fn().mockResolvedValue({ name: 'New Latte' }),
		});
		const handler = getHandler(menuRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: '123' }, body: { name: 'New Latte' } }, res);

		expect(res.json.mock.calls[0][0].item.name).toBe('New Latte');
	});

	it('returns 404 when updating a missing menu item', async () => {
		mockFindByIdAndUpdate.mockReturnValue({
			lean: jest.fn().mockResolvedValue(null),
		});
		const handler = getHandler(menuRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' }, body: { name: 'New Latte' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('deletes a menu item', async () => {
		mockFindByIdAndDelete.mockReturnValue({
			lean: jest.fn().mockResolvedValue({ name: 'Latte' }),
		});
		const handler = getHandler(menuRouter, 'delete', '/:id');
		const res = createMockRes();

		await handler({ params: { id: '123' } }, res);

		expect(res.json.mock.calls[0][0].message).toContain('deleted');
	});

	it('returns 404 when deleting a missing menu item', async () => {
		mockFindByIdAndDelete.mockReturnValue({
			lean: jest.fn().mockResolvedValue(null),
		});
		const handler = getHandler(menuRouter, 'delete', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});
});