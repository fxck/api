import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { API_VERSION } from '@fxck/contracts';

test('GET /health returns the contract version', async () => {
  const app = createApp();
  const res = await app.request('/health');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { version: API_VERSION });
});
