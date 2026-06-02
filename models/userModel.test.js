import { describe, expect, it } from '@jest/globals';

import User from './userModel.js';

describe('User model', () => {
	it('hashes and verifies passwords', () => {
		const user = new User({
			name: 'Ava',
			email: 'ava@example.com',
		});

		user.setPassword('secret123');

		expect(user.passwordSalt).toBeTruthy();
		expect(user.passwordHash).toBeTruthy();
		expect(user.verifyPassword('secret123')).toBe(true);
		expect(user.verifyPassword('wrong-password')).toBe(false);
	});

	it('defaults to the user role', () => {
		const user = new User({
			name: 'Ben',
			email: 'ben@example.com',
			passwordHash: 'hash',
			passwordSalt: 'salt',
		});

		expect(user.role).toBe('user');
	});
});