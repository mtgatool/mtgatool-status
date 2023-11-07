/* eslint-env jest */
const sslChecker = require('ssl-checker');
const https = require('https');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const GLOBAL_STATE = Symbol.for('$$jest-matchers-object');

afterAll(() => {
	if (global[GLOBAL_STATE].state.snapshotState.matched !== 1) {
		console.log('\x1b[31mWARNING!!! Catch snapshot failure here and print some message about it...');
	}
});

const URLS = ['mtgatool.com', 'api.mtgatool.com', 'app.mtgatool.com'];

describe('SSL Certificates', () => {
	test.each(URLS)('SSL Certificate for %p', async (url) => {
		await sslChecker(url)
			.then((res) => {
				// Alert me if the cert is going to expire in less than 5 days
				expect(res.daysRemaining).toBeGreaterThan(5);
			})
			.catch((err) => {
				throw new Error(err);
			});
	});
});

const httpGetAsync = (url) => {
	return new Promise((resolve, reject) => {
		https
			.get(url, function(res) {
				res.on('data', function() {
					resolve(res.statusCode);
					res.destroy();
				});

			})
			.on('error', function(e) {
				reject(e);
			});
	});
};

describe('HTTP Status', () => {
	test.each(URLS)('HTTP Status for %p', async (url) => {
		const statusCode = await httpGetAsync(`https://${url}/`).catch((err) => {
			throw new Error(err);
		});
		expect(statusCode).toBe(200);
	});
});
