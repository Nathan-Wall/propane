import { UnionFirstNumber, UnionFirstString, OptionalField, RequiredMessage } from './repro-empty-new.pmsg.ts';
import assert from 'node:assert';

export default function () {
  console.log('Testing UnionFirstNumber...');
  const num = new UnionFirstNumber();
  assert.strictEqual(num.val, 0, 'UnionFirstNumber should default to 0');
  console.log('UnionFirstNumber passed.');

  console.log('Testing UnionFirstString...');
  const str = new UnionFirstString();
  assert.strictEqual(str.val, "", 'UnionFirstString should default to ""');
  console.log('UnionFirstString passed.');

  console.log('Testing OptionalField...');
  const opt = new OptionalField();
  assert.strictEqual(opt.val, undefined, 'OptionalField should default to undefined');
  console.log('OptionalField passed.');

  console.log('Testing RequiredMessage...');
  const req = new RequiredMessage();
  assert.ok(req.sub instanceof UnionFirstNumber, 'RequiredMessage.sub should be instance of UnionFirstNumber');
  assert.strictEqual(req.sub.val, 0, 'RequiredMessage.sub.val should default to 0');
  console.log('RequiredMessage passed.');

  console.log('Testing Memoization...');
  const num1 = new UnionFirstNumber();
  const num2 = new UnionFirstNumber();
  assert.strictEqual(num1, num2, 'Empty instances should be memoized (reference equality)');

  const str1 = new UnionFirstString();
  const str2 = new UnionFirstString();
  assert.strictEqual(str1, str2, 'Empty instances should be memoized (reference equality)');

  const req1 = new RequiredMessage();
  const req2 = new RequiredMessage();
  assert.strictEqual(req1, req2, 'Empty instances should be memoized (reference equality)');
  assert.strictEqual(req1.sub, req2.sub, 'Nested empty instances should be memoized');
  console.log('Memoization passed.');

  console.log('All tests passed!');
}
