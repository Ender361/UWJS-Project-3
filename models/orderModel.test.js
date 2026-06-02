import { describe, expect, it } from '@jest/globals';

import Order from './orderModel.js';

describe('Order model', () => {
	it('requires at least one item', () => {
		const order = new Order({
			user: '507f1f77bcf86cd799439011',
			items: [],
		});

		const error = order.validateSync();
		expect(error).toBeTruthy();
		expect(error.errors.items).toBeTruthy();
	});

	it('accepts a valid order', () => {
		const order = new Order({
			user: '507f1f77bcf86cd799439011',
			items: [
				{
					menuItemId: '507f1f77bcf86cd799439012',
					name: 'Latte',
					price: 5,
					quantity: 2,
				},
			],
		});

		expect(order.validateSync()).toBeUndefined();
	});
});