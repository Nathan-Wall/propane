/**
 * Tests for path-aware equality with identical siblings.
 *
 * Problem: When two sibling messages have the same content, memoPropane
 * can't distinguish them because path registration isn't wired up.
 *
 * Example:
 *   const state = new AppState({
 *     todos: [new Todo('hello'), new Todo('hello')]
 *   });
 *
 * Both todos[0] and todos[1] have the same content, so:
 *   todos[0].equals(todos[1]) === true
 *
 * Without path-aware equality, memoPropane can't tell them apart,
 * which can lead to incorrect rendering behavior.
 */

import { assert } from './assert.ts';
import {
  REGISTER_PATH,
  FROM_ROOT,
  EQUALS_FROM_ROOT,
} from '../runtime/symbols.ts';
import type { Message, DataObject } from '../runtime/message.ts';

// Import Babel-generated types for testing
import { InnerMessage, OuterMessage } from './nested-memo-state.propane.ts';

export default function runPathAwareEqualityTests() {
  testIdenticalSiblingsAreContentEqual();
  testPathRegistrationDistinguishesSiblings();
  testEqualsFromRootWithoutRegistration();
  testEqualsFromRootWithRegistration();
  testMemoPropaneWithIdenticalSiblings();
  console.log('All path-aware equality tests completed!');
}

/**
 * Test that two messages with identical content are equal by content.
 * This is expected behavior - content equality should work.
 */
function testIdenticalSiblingsAreContentEqual() {
  console.log('Testing: identical siblings are content-equal...');

  const todo1 = new InnerMessage({ value: 'hello' });
  const todo2 = new InnerMessage({ value: 'hello' });

  // Content equality should return true
  assert(
    todo1.equals(todo2),
    'Two messages with same content should be content-equal'
  );

  // They are different instances
  assert(
    todo1 !== todo2,
    'They should be different object instances'
  );

  console.log('Identical siblings are content-equal: PASSED');
}

/**
 * Test that REGISTER_PATH sets up paths correctly.
 * After registration, siblings should have different paths.
 */
function testPathRegistrationDistinguishesSiblings() {
  console.log('Testing: path registration distinguishes siblings...');

  // Create a parent with two identical children
  const inner1 = new InnerMessage({ value: 'hello' });
  const inner2 = new InnerMessage({ value: 'hello' });

  // Create a simple container to act as root
  // We'll use OuterMessage but manually register paths
  const root = new OuterMessage({ counter: 0, inner: inner1 });

  // Manually register paths (simulating what should happen automatically)
  type Registerable = {
    [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void;
    [FROM_ROOT]: (root: Message<DataObject>) => string | undefined;
  };

  // Register inner1 at path "inner"
  (inner1 as unknown as Registerable)[REGISTER_PATH](
    root as unknown as Message<DataObject>,
    'inner'
  );

  // Register inner2 at a different path (simulating array index)
  (inner2 as unknown as Registerable)[REGISTER_PATH](
    root as unknown as Message<DataObject>,
    'siblings[1]'
  );

  // Check paths are set correctly
  const path1 = (inner1 as unknown as Registerable)[FROM_ROOT](
    root as unknown as Message<DataObject>
  );
  const path2 = (inner2 as unknown as Registerable)[FROM_ROOT](
    root as unknown as Message<DataObject>
  );

  console.log(`  inner1 path: ${path1}`);
  console.log(`  inner2 path: ${path2}`);

  assert(
    path1 === 'inner',
    `Expected inner1 path to be 'inner', got '${path1}'`
  );

  assert(
    path2 === 'siblings[1]',
    `Expected inner2 path to be 'siblings[1]', got '${path2}'`
  );

  assert(
    path1 !== path2,
    'Paths should be different for siblings'
  );

  console.log('Path registration distinguishes siblings: PASSED');
}

/**
 * Test EQUALS_FROM_ROOT without path registration.
 * Without registration, it falls back to content equality.
 *
 * This documents expected behavior when NOT using usePropaneState:
 * If you create messages directly without path registration,
 * equalsFromRoot will fall back to content equality.
 */
function testEqualsFromRootWithoutRegistration() {
  console.log('Testing: equalsFromRoot WITHOUT path registration (raw API)...');

  const inner1 = new InnerMessage({ value: 'hello' });
  const inner2 = new InnerMessage({ value: 'hello' });
  const root = new OuterMessage({ counter: 0, inner: inner1 });

  type PathAware = {
    [EQUALS_FROM_ROOT]: (root: unknown, other: unknown) => boolean;
  };

  // Without REGISTER_PATH being called, equalsFromRoot falls back to content equality
  const areEqualFromRoot = (inner1 as unknown as PathAware)[EQUALS_FROM_ROOT](
    root,
    inner2
  );

  console.log(`  inner1.equals(inner2) = ${inner1.equals(inner2)}`);
  console.log(`  equalsFromRoot(root, inner1, inner2) = ${areEqualFromRoot}`);

  // Without path registration, equalsFromRoot returns true (falls back to content equality)
  // This is expected behavior for raw API usage without usePropaneState
  assert(
    areEqualFromRoot === true,
    'Without path registration, equalsFromRoot should fall back to content equality (true)'
  );

  console.log('  NOTE: This is expected - use usePropaneState for path-aware equality');
  console.log('equalsFromRoot WITHOUT path registration: PASSED (falls back to content equality)');
}

/**
 * Test EQUALS_FROM_ROOT with manual path registration.
 * With registration, it should correctly distinguish siblings.
 */
function testEqualsFromRootWithRegistration() {
  console.log('Testing: equalsFromRoot WITH path registration...');

  const inner1 = new InnerMessage({ value: 'hello' });
  const inner2 = new InnerMessage({ value: 'hello' });
  const root = new OuterMessage({ counter: 0, inner: inner1 });

  type Registerable = {
    [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void;
  };

  type PathAware = {
    [EQUALS_FROM_ROOT]: (root: unknown, other: unknown) => boolean;
  };

  // Manually register paths
  (inner1 as unknown as Registerable)[REGISTER_PATH](
    root as unknown as Message<DataObject>,
    'todos[0]'
  );
  (inner2 as unknown as Registerable)[REGISTER_PATH](
    root as unknown as Message<DataObject>,
    'todos[1]'
  );

  // With paths registered, equalsFromRoot should distinguish them
  const areEqualFromRoot = (inner1 as unknown as PathAware)[EQUALS_FROM_ROOT](
    root,
    inner2
  );

  console.log(`  inner1.equals(inner2) = ${inner1.equals(inner2)}`);
  console.log(`  equalsFromRoot(root, inner1, inner2) = ${areEqualFromRoot}`);

  // Content is equal
  assert(
    inner1.equals(inner2),
    'Content should be equal'
  );

  // But equalsFromRoot should return false because paths differ
  assert(
    areEqualFromRoot === false,
    'equalsFromRoot should return false because paths differ (todos[0] vs todos[1])'
  );

  console.log('equalsFromRoot WITH path registration: PASSED');
}

/**
 * Test memoPropane scenario with identical siblings using simulated usePropaneState.
 *
 * This test simulates what usePropaneState does:
 * 1. Create state with identical siblings
 * 2. Register paths on the state tree (what usePropaneState now does)
 * 3. Verify that equalsFromRoot can distinguish siblings by path
 *
 * Scenario:
 * - Parent has state with two conceptual "todos" at different positions
 * - Both todos have identical content
 * - With path registration, equalsFromRoot distinguishes them by position
 */
function testMemoPropaneWithIdenticalSiblings() {
  console.log('Testing: memoPropane with identical siblings (simulated usePropaneState)...');

  // Simulate the memoPropane equality check (from react/index.ts)
  type PathAware = {
    [EQUALS_FROM_ROOT]: (root: unknown, other: unknown) => boolean;
  };

  type Registerable = {
    [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void;
  };

  function isEqualsFromRootCapable(value: unknown): value is PathAware {
    return (
      value !== null
      && typeof value === 'object'
      && EQUALS_FROM_ROOT in value
      && typeof (value as Record<symbol, unknown>)[EQUALS_FROM_ROOT] === 'function'
    );
  }

  function equalsFromRoot(root: unknown, a: unknown, b: unknown): boolean {
    if (isEqualsFromRootCapable(a) && isEqualsFromRootCapable(b)) {
      return a[EQUALS_FROM_ROOT](root, b);
    }
    return Object.is(a, b);
  }

  // Simulate usePropaneState's registerPaths function
  function registerPaths(root: unknown): void {
    if (
      root !== null
      && typeof root === 'object'
      && REGISTER_PATH in root
    ) {
      (root as Registerable)[REGISTER_PATH](root as Message<DataObject>, '');
    }
  }

  // Create two identical messages at different conceptual positions
  const todo0 = new InnerMessage({ value: 'buy milk' });
  const todo1 = new InnerMessage({ value: 'buy milk' }); // Same content!

  // Create a root state
  const parentState = new OuterMessage({ counter: 0, inner: todo0 });

  // Simulate what usePropaneState does: register paths on the state tree
  registerPaths(parentState);

  // Also manually register todo0 and todo1 at different paths
  // (In real usage, these would be registered as part of an array container)
  (todo0 as unknown as Registerable)[REGISTER_PATH](
    parentState as unknown as Message<DataObject>,
    'todos[0]'
  );
  (todo1 as unknown as Registerable)[REGISTER_PATH](
    parentState as unknown as Message<DataObject>,
    'todos[1]'
  );

  // Verify content equality still works
  assert(
    todo0.equals(todo1),
    'Content should be equal'
  );

  console.log(`  todo0.equals(todo1) = ${todo0.equals(todo1)} (content equal)`);

  // Now test path-aware equality
  const crossSiblingEqual = equalsFromRoot(
    parentState,
    todo0,  // At todos[0]
    todo1   // At todos[1] (different position, same content)
  );

  console.log(`  equalsFromRoot(parentState, todo0, todo1) = ${crossSiblingEqual}`);

  // With paths registered, equalsFromRoot should return FALSE
  // because the paths differ (todos[0] vs todos[1])
  assert(
    crossSiblingEqual === false,
    'equalsFromRoot should return false because paths differ (todos[0] vs todos[1])'
  );

  console.log('  SUCCESS: Path-aware equality distinguishes identical siblings!');
  console.log('memoPropane with identical siblings: PASSED');
}
