import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { EndpointMessage, ResponseOf } from '@propanejs/pms-core';
import { TestRequest, TestResponse } from './endpoint-types.pmsg.js';

describe('Endpoint type compatibility', () => {
  it('TestRequest extends Message and has expected properties', () => {
    const msg = new TestRequest({ id: 1 });
    // Verify the message works correctly
    assert.strictEqual(msg.id, 1);
    assert.strictEqual(msg.$typeName, 'TestRequest');
    // The __responseType is a phantom type (compile-time only, not runtime)
    // Type checking happens at compile time via TypeScript
  });

  it('generated class satisfies EndpointMessage constraint', () => {
    // Compile-time test - if this compiles, the types are compatible
    const msg = new TestRequest({ id: 1 });
    const endpoint: EndpointMessage<TestRequest, TestResponse> = msg;
    assert.ok(endpoint);
  });

  it('ResponseOf extracts correct response type', () => {
    // Compile-time test
    type Response = ResponseOf<TestRequest>;
    // Runtime verification that the types align
    const response = new TestResponse({ value: 'test' });
    const typed: Response = response;
    assert.strictEqual(typed.value, 'test');
  });
});
