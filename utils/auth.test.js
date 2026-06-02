import { describe, expect, it } from '@jest/globals';

import { createToken, verifyToken } from './auth.js';

describe('auth utils', () => {
	it('creates and verifies a token payload', () => {
		const payload = { userId: '123', role: 'admin' };
		const token = createToken(payload);

		expect(typeof token).toBe('string');
		expect(verifyToken(token)).toEqual(payload);
	});

	it('rejects a token with the wrong signature', () => {
		const token = createToken({ userId: '123' });
		const tampered = `${token}x`;

		expect(() => verifyToken(tampered)).toThrow('Invalid token signature');
	});

	it('rejects malformed tokens', () => {
		expect(() => verifyToken('not-a-token')).toThrow('Invalid token format');
	});
});