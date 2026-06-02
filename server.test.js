import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';

import server from './server.js';

describe('basic routes', () => {
	let httpServer;
	let baseUrl;

	beforeAll(async () => {
		httpServer = server.listen(0);
		await new Promise((resolve) => {
			httpServer.once('listening', resolve);
		});
		const { port } = httpServer.address();
		baseUrl = `http://127.0.0.1:${port}`;
	});

	afterAll(async () => {
		await new Promise((resolve) => httpServer.close(resolve));
	});

	it('returns ok from /health', async () => {
		const res = await fetch(`${baseUrl}/health`);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it('returns the landing page from /', async () => {
		const res = await fetch(`${baseUrl}/`);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain('A small coffee shop API for class');
	});
});