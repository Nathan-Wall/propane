import { UnionFirstNumber, UnionFirstString, OptionalField, RequiredMessage } from './repro_empty_new.propane.ts';
import assert from 'assert';

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

  console.log('All tests passed!');
}
