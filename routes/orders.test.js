import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockAggregate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

const mockMenuFindById = jest.fn();

const MockOrder = {
	find: mockFind,
	findById: mockFindById,
	create: mockCreate,
	aggregate: mockAggregate,
	findByIdAndDelete: mockFindByIdAndDelete,
};

const MockMenuItem = {
	findById: mockMenuFindById,
};

await jest.unstable_mockModule('../models/orderModel.js', () => ({
	default: MockOrder,
}));

await jest.unstable_mockModule('../models/menuItemModel.js', () => ({
	default: MockMenuItem,
}));

await jest.unstable_mockModule('../middleware/auth.js', () => ({
	authRequired: (_req, _res, next) => next(),
	adminOnly: (_req, _res, next) => next(),
}));

const { default: orderRouter } = await import('./orders.js');

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

describe('orders routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns user orders for normal users', async () => {
		mockFind.mockReturnValue({
			sort: jest.fn().mockReturnValue({
				lean: jest.fn().mockResolvedValue([{ status: 'pending' }]),
			}),
		});
		const handler = getHandler(orderRouter, 'get', '/');
		const res = createMockRes();

		await handler({ user: { role: 'user', _id: 'u1' } }, res);

		expect(res.json.mock.calls[0][0].orders).toHaveLength(1);
	});

	it('returns all orders for admins', async () => {
		mockFind.mockReturnValue({
			sort: jest.fn().mockReturnValue({
				lean: jest.fn().mockResolvedValue([{ status: 'completed' }]),
			}),
		});
		const handler = getHandler(orderRouter, 'get', '/');
		const res = createMockRes();

		await handler({ user: { role: 'admin', _id: 'admin1' } }, res);

		expect(res.json.mock.calls[0][0].orders[0].status).toBe('completed');
	});

	it('returns 404 for a missing order', async () => {
		mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
		const handler = getHandler(orderRouter, 'get', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' }, user: { role: 'admin', _id: 'a1' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('blocks non-owners from viewing an order', async () => {
		mockFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue({ user: 'owner-id' }),
		});
		const handler = getHandler(orderRouter, 'get', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'order1' }, user: { role: 'user', _id: 'other-id' } }, res);

		expect(res.status).toHaveBeenCalledWith(403);
	});

	it('creates an order', async () => {
		mockMenuFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue({ _id: 'm1', name: 'Latte', price: 5 }),
		});
		mockCreate.mockResolvedValue({ _id: 'o1' });
		const handler = getHandler(orderRouter, 'post', '/');
		const res = createMockRes();

		await handler(
			{
				user: { _id: 'u1', role: 'user' },
				body: { items: [{ menuItemId: 'm1', quantity: 2 }], notes: 'Extra hot' },
			},
			res,
		);

		expect(mockCreate).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(201);
	});

	it('rejects empty order payloads', async () => {
		const handler = getHandler(orderRouter, 'post', '/');
		const res = createMockRes();

		await handler({ user: { _id: 'u1', role: 'user' }, body: { items: [] } }, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('rejects order items without menuItemId', async () => {
		const handler = getHandler(orderRouter, 'post', '/');
		const res = createMockRes();

		await handler({ user: { _id: 'u1', role: 'user' }, body: { items: [{}] } }, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('rejects missing menu items when ordering', async () => {
		mockMenuFindById.mockReturnValue({
			lean: jest.fn().mockResolvedValue(null),
		});
		const handler = getHandler(orderRouter, 'post', '/');
		const res = createMockRes();

		await handler(
			{
				user: { _id: 'u1', role: 'user' },
				body: { items: [{ menuItemId: 'missing' }] },
			},
			res,
		);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('lets admins change order status', async () => {
		const savedOrder = { save: jest.fn().mockResolvedValue(undefined), status: 'pending', notes: '' };
		mockFindById.mockResolvedValue(savedOrder);
		const handler = getHandler(orderRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'o1' }, user: { role: 'admin', _id: 'admin1' }, body: { status: 'completed' } }, res);

		expect(savedOrder.status).toBe('completed');
		expect(res.json.mock.calls[0][0].order.status).toBe('completed');
	});

	it('lets users update their own notes', async () => {
		const savedOrder = {
			user: 'u1',
			save: jest.fn().mockResolvedValue(undefined),
			status: 'pending',
			notes: 'old',
		};
		mockFindById.mockResolvedValue(savedOrder);
		const handler = getHandler(orderRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'o1' }, user: { role: 'user', _id: 'u1' }, body: { notes: 'new notes' } }, res);

		expect(savedOrder.notes).toBe('new notes');
	});

	it('returns 404 when patching a missing order', async () => {
		mockFindById.mockResolvedValue(null);
		const handler = getHandler(orderRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' }, user: { role: 'admin', _id: 'a1' }, body: { status: 'completed' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('blocks non-owners from patching orders', async () => {
		mockFindById.mockResolvedValue({ user: 'owner-id', save: jest.fn().mockResolvedValue(undefined) });
		const handler = getHandler(orderRouter, 'patch', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'o1' }, user: { role: 'user', _id: 'other' }, body: { notes: 'x' } }, res);

		expect(res.status).toHaveBeenCalledWith(403);
	});

	it('deletes an order for admins', async () => {
		mockFindByIdAndDelete.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'o1' }) });
		const handler = getHandler(orderRouter, 'delete', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'o1' }, user: { role: 'admin', _id: 'a1' } }, res);

		expect(res.json.mock.calls[0][0].message).toContain('deleted');
	});

	it('returns 404 when deleting a missing order', async () => {
		mockFindByIdAndDelete.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
		const handler = getHandler(orderRouter, 'delete', '/:id');
		const res = createMockRes();

		await handler({ params: { id: 'missing' }, user: { role: 'admin', _id: 'a1' } }, res);

		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('returns order summary stats', async () => {
		mockAggregate.mockResolvedValue([{ _id: 'pending', orders: 2, revenue: 10 }]);
		const layer = orderRouter.stack.find(
			(entry) => entry.route?.path === '/stats/summary' && entry.route.methods.get,
		);
		const handler = layer.route.stack[layer.route.stack.length - 1].handle;
		const res = createMockRes();

		await handler({ user: { role: 'admin', _id: 'a1' } }, res);

		expect(res.json.mock.calls[0][0].summary[0].revenue).toBe(10);
	});
});