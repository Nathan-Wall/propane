import { assert, assertThrows } from './assert.js';
import {
  Unions,
  Unions_Metadata_Union1,
  Unions_Metadata_Union2,
  Unions_Items_Item_Union1,
  Unions_Items_Item_Union2,
  Unions_ItemSet_Item_Union1,
  Unions_ItemSet_Item_Union2,
  Unions_ItemMap_Value_Union1,
  Unions_ItemMap_Value_Union2,
} from './unions.pmsg.js';
import { ImmutableDate } from '../runtime/common/time/date.js';
import { test } from 'node:test';

export default function runUnionsImplicitUnionTests() {
  const created = new Date('2024-01-01T00:00:00.000Z');
  const updated = new Date('2024-02-02T00:00:00.000Z');

  const createdMeta = new Unions_Metadata_Union1({ created });
  const itemCreated = new Unions_Items_Item_Union1({ created });
  const itemUpdated = new Unions_Items_Item_Union2({ updated });
  const setCreated = new Unions_ItemSet_Item_Union1({ created });
  const setUpdated = new Unions_ItemSet_Item_Union2({ updated });
  const mapCreated = new Unions_ItemMap_Value_Union1({ created });
  const mapUpdated = new Unions_ItemMap_Value_Union2({ updated });
  const createdItemMap = new Map<
    string,
    Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2
  >([['a', mapCreated], ['b', mapUpdated]]);
  const createdUnion = new Unions({
    username: null,
    email: null,
    metadata: createdMeta,
    items: [itemCreated, itemUpdated],
    itemSet: new Set([setCreated, setUpdated]),
    itemMap: createdItemMap,
  });
  const createdSerialized = createdUnion.serialize();
  assert(
    createdSerialized.includes('$Unions_Metadata_Union1{'),
    `metadata should be tagged as Unions_Metadata_Union1. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_Items_Item_Union1{'),
    `items should include Unions_Items_Item_Union1. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_Items_Item_Union2{'),
    `items should include Unions_Items_Item_Union2. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_ItemSet_Item_Union1{'),
    `itemSet should include Unions_ItemSet_Item_Union1. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_ItemSet_Item_Union2{'),
    `itemSet should include Unions_ItemSet_Item_Union2. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_ItemMap_Value_Union1{'),
    `itemMap should include Unions_ItemMap_Value_Union1. Got: ${createdSerialized}`
  );
  assert(
    createdSerialized.includes('$Unions_ItemMap_Value_Union2{'),
    `itemMap should include Unions_ItemMap_Value_Union2. Got: ${createdSerialized}`
  );

  const createdDeserialized = Unions.deserialize(createdSerialized);
  assert(
    createdDeserialized.metadata instanceof Unions_Metadata_Union1,
    `metadata should deserialize to Unions_Metadata_Union1. Got: ${createdDeserialized.metadata?.constructor?.name}`
  );
  const createdOut = createdDeserialized.metadata as Unions_Metadata_Union1;
  assert(
    createdOut.created instanceof Date || createdOut.created instanceof ImmutableDate,
    'created should be Date/ImmutableDate'
  );
  assert(createdOut.created.getTime() === created.getTime(), 'created value matches');
  assert(
    createdDeserialized.items?.[0] instanceof Unions_Items_Item_Union1,
    `items[0] should be Unions_Items_Item_Union1. Got: ${createdDeserialized.items?.[0]?.constructor?.name}`
  );
  assert(
    createdDeserialized.items?.[1] instanceof Unions_Items_Item_Union2,
    `items[1] should be Unions_Items_Item_Union2. Got: ${createdDeserialized.items?.[1]?.constructor?.name}`
  );
  const setValues = createdDeserialized.itemSet ? [...createdDeserialized.itemSet.values()] : [];
  assert(
    setValues.some((value) => value instanceof Unions_ItemSet_Item_Union1),
    'itemSet should include Unions_ItemSet_Item_Union1'
  );
  assert(
    setValues.some((value) => value instanceof Unions_ItemSet_Item_Union2),
    'itemSet should include Unions_ItemSet_Item_Union2'
  );
  assert(
    createdDeserialized.itemMap?.get('a') instanceof Unions_ItemMap_Value_Union1,
    `itemMap['a'] should be Unions_ItemMap_Value_Union1. Got: ${createdDeserialized.itemMap?.get('a')?.constructor?.name}`
  );
  assert(
    createdDeserialized.itemMap?.get('b') instanceof Unions_ItemMap_Value_Union2,
    `itemMap['b'] should be Unions_ItemMap_Value_Union2. Got: ${createdDeserialized.itemMap?.get('b')?.constructor?.name}`
  );

  const updatedMeta = new Unions_Metadata_Union2({ updated });
  const updatedItemMap = new Map<
    string,
    Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2
  >([['b', mapUpdated], ['a', mapCreated]]);
  const updatedUnion = new Unions({
    username: null,
    email: null,
    metadata: updatedMeta,
    items: [itemUpdated, itemCreated],
    itemSet: new Set([setUpdated, setCreated]),
    itemMap: updatedItemMap,
  });
  const updatedSerialized = updatedUnion.serialize();
  assert(
    updatedSerialized.includes('$Unions_Metadata_Union2{'),
    `metadata should be tagged as Unions_Metadata_Union2. Got: ${updatedSerialized}`
  );

  const updatedDeserialized = Unions.deserialize(updatedSerialized);
  assert(
    updatedDeserialized.metadata instanceof Unions_Metadata_Union2,
    `metadata should deserialize to Unions_Metadata_Union2. Got: ${updatedDeserialized.metadata?.constructor?.name}`
  );
  const updatedOut = updatedDeserialized.metadata as Unions_Metadata_Union2;
  assert(
    updatedOut.updated instanceof Date || updatedOut.updated instanceof ImmutableDate,
    'updated should be Date/ImmutableDate'
  );
  assert(updatedOut.updated.getTime() === updated.getTime(), 'updated value matches');

  const untagged = `:{username:null,email:null,metadata:{created:D"${created.toISOString()}"}}`;
  assertThrows(
    () => Unions.deserialize(untagged),
    'untagged metadata should throw for ambiguous message unions.'
  );
}

test('runUnionsImplicitUnionTests', () => {
  runUnionsImplicitUnionTests();
});
