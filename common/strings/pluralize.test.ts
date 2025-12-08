import { describe, it } from 'node:test';
import assert from 'node:assert';
import { pluralize, singularize } from './pluralize.js';

describe('pluralize', () => {
  describe('regular nouns', () => {
    it('adds s to regular nouns', () => {
      assert.strictEqual(pluralize('User'), 'Users');
      assert.strictEqual(pluralize('Post'), 'Posts');
      assert.strictEqual(pluralize('Comment'), 'Comments');
      assert.strictEqual(pluralize('Tag'), 'Tags');
      assert.strictEqual(pluralize('Role'), 'Roles');
    });

    it('preserves lowercase', () => {
      assert.strictEqual(pluralize('user'), 'users');
      assert.strictEqual(pluralize('post'), 'posts');
    });
  });

  describe('nouns ending in consonant + y', () => {
    it('changes y to ies', () => {
      assert.strictEqual(pluralize('Category'), 'Categories');
      assert.strictEqual(pluralize('Entity'), 'Entities');
      assert.strictEqual(pluralize('Query'), 'Queries');
      assert.strictEqual(pluralize('Policy'), 'Policies');
      assert.strictEqual(pluralize('Company'), 'Companies');
      assert.strictEqual(pluralize('City'), 'Cities');
    });
  });

  describe('nouns ending in vowel + y', () => {
    it('adds s (does not change to ies)', () => {
      assert.strictEqual(pluralize('Key'), 'Keys');
      assert.strictEqual(pluralize('Day'), 'Days');
      assert.strictEqual(pluralize('Boy'), 'Boys');
      assert.strictEqual(pluralize('Toy'), 'Toys');
      assert.strictEqual(pluralize('Array'), 'Arrays');
      assert.strictEqual(pluralize('Survey'), 'Surveys');
    });
  });

  describe('nouns ending in s, x, z, ch, sh', () => {
    it('adds es', () => {
      assert.strictEqual(pluralize('Status'), 'Statuses');
      assert.strictEqual(pluralize('Class'), 'Classes');
      assert.strictEqual(pluralize('Box'), 'Boxes');
      assert.strictEqual(pluralize('Fez'), 'Fezes');
      assert.strictEqual(pluralize('Batch'), 'Batches');
      assert.strictEqual(pluralize('Match'), 'Matches');
      assert.strictEqual(pluralize('Flash'), 'Flashes');
      assert.strictEqual(pluralize('Wish'), 'Wishes');
    });
  });

  describe('nouns ending in f/fe', () => {
    it('changes f to ves', () => {
      assert.strictEqual(pluralize('Leaf'), 'Leaves');
      assert.strictEqual(pluralize('Half'), 'Halves');
      assert.strictEqual(pluralize('Self'), 'Selves');
      assert.strictEqual(pluralize('Wolf'), 'Wolves');
    });

    it('changes fe to ves', () => {
      assert.strictEqual(pluralize('Life'), 'Lives');
      assert.strictEqual(pluralize('Wife'), 'Wives');
      assert.strictEqual(pluralize('Knife'), 'Knives');
    });

    it('keeps roof/proof as regular', () => {
      assert.strictEqual(pluralize('Roof'), 'Roofs');
      assert.strictEqual(pluralize('Proof'), 'Proofs');
    });
  });

  describe('nouns ending in consonant + o', () => {
    it('adds es', () => {
      assert.strictEqual(pluralize('Hero'), 'Heroes');
      assert.strictEqual(pluralize('Echo'), 'Echoes');
      assert.strictEqual(pluralize('Tomato'), 'Tomatoes');
      assert.strictEqual(pluralize('Potato'), 'Potatoes');
    });

    it('adds s for common exceptions', () => {
      assert.strictEqual(pluralize('Photo'), 'Photos');
      assert.strictEqual(pluralize('Piano'), 'Pianos');
      assert.strictEqual(pluralize('Memo'), 'Memos');
      assert.strictEqual(pluralize('Logo'), 'Logos');
      assert.strictEqual(pluralize('Zero'), 'Zeros');
    });
  });

  describe('nouns ending in vowel + o', () => {
    it('adds s', () => {
      assert.strictEqual(pluralize('Video'), 'Videos');
      assert.strictEqual(pluralize('Radio'), 'Radios');
      assert.strictEqual(pluralize('Studio'), 'Studios');
    });
  });

  describe('irregular nouns', () => {
    it('handles common irregulars', () => {
      assert.strictEqual(pluralize('Person'), 'People');
      assert.strictEqual(pluralize('Child'), 'Children');
      assert.strictEqual(pluralize('Man'), 'Men');
      assert.strictEqual(pluralize('Woman'), 'Women');
      assert.strictEqual(pluralize('Foot'), 'Feet');
      assert.strictEqual(pluralize('Tooth'), 'Teeth');
      assert.strictEqual(pluralize('Mouse'), 'Mice');
    });

    it('handles Latin/Greek irregulars', () => {
      assert.strictEqual(pluralize('Index'), 'Indices');
      assert.strictEqual(pluralize('Criterion'), 'Criteria');
      assert.strictEqual(pluralize('Phenomenon'), 'Phenomena');
      assert.strictEqual(pluralize('Analysis'), 'Analyses');
      assert.strictEqual(pluralize('Crisis'), 'Crises');
    });

    it('preserves casing for irregulars', () => {
      assert.strictEqual(pluralize('person'), 'people');
      assert.strictEqual(pluralize('Person'), 'People');
    });
  });

  describe('uncountable nouns', () => {
    it('returns unchanged', () => {
      assert.strictEqual(pluralize('Sheep'), 'Sheep');
      assert.strictEqual(pluralize('Fish'), 'Fish');
      assert.strictEqual(pluralize('Deer'), 'Deer');
      assert.strictEqual(pluralize('Software'), 'Software');
      assert.strictEqual(pluralize('Information'), 'Information');
      assert.strictEqual(pluralize('Metadata'), 'Metadata');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      assert.strictEqual(pluralize(''), '');
    });

    it('handles single character', () => {
      assert.strictEqual(pluralize('A'), 'As');
      assert.strictEqual(pluralize('x'), 'xes');
    });

    it('handles common programming identifiers', () => {
      assert.strictEqual(pluralize('User'), 'Users');
      assert.strictEqual(pluralize('Account'), 'Accounts');
      assert.strictEqual(pluralize('Order'), 'Orders');
      assert.strictEqual(pluralize('Product'), 'Products');
      assert.strictEqual(pluralize('Category'), 'Categories');
      assert.strictEqual(pluralize('Address'), 'Addresses');
      assert.strictEqual(pluralize('Company'), 'Companies');
      assert.strictEqual(pluralize('Employee'), 'Employees');
      assert.strictEqual(pluralize('Customer'), 'Customers');
      assert.strictEqual(pluralize('Invoice'), 'Invoices');
    });
  });
});

describe('singularize', () => {
  describe('regular plurals', () => {
    it('removes s from regular plurals', () => {
      assert.strictEqual(singularize('Users'), 'User');
      assert.strictEqual(singularize('Posts'), 'Post');
      assert.strictEqual(singularize('Comments'), 'Comment');
    });
  });

  describe('plurals ending in ies', () => {
    it('changes ies to y', () => {
      assert.strictEqual(singularize('Categories'), 'Category');
      assert.strictEqual(singularize('Entities'), 'Entity');
      assert.strictEqual(singularize('Queries'), 'Query');
    });
  });

  describe('plurals ending in es', () => {
    it('removes es from s/x/z/ch/sh bases', () => {
      assert.strictEqual(singularize('Statuses'), 'Status');
      assert.strictEqual(singularize('Classes'), 'Class');
      assert.strictEqual(singularize('Boxes'), 'Box');
      assert.strictEqual(singularize('Batches'), 'Batch');
      assert.strictEqual(singularize('Wishes'), 'Wish');
    });
  });

  describe('plurals ending in ves', () => {
    it('changes ves to f', () => {
      assert.strictEqual(singularize('Leaves'), 'Leaf');
      assert.strictEqual(singularize('Halves'), 'Half');
      assert.strictEqual(singularize('Wolves'), 'Wolf');
    });

    it('changes ves to fe for common cases', () => {
      assert.strictEqual(singularize('Lives'), 'Life');
      assert.strictEqual(singularize('Wives'), 'Wife');
      assert.strictEqual(singularize('Knives'), 'Knife');
    });
  });

  describe('irregular plurals', () => {
    it('handles common irregulars', () => {
      assert.strictEqual(singularize('People'), 'Person');
      assert.strictEqual(singularize('Children'), 'Child');
      assert.strictEqual(singularize('Men'), 'Man');
      assert.strictEqual(singularize('Women'), 'Woman');
      assert.strictEqual(singularize('Feet'), 'Foot');
      assert.strictEqual(singularize('Teeth'), 'Tooth');
      assert.strictEqual(singularize('Mice'), 'Mouse');
    });

    it('preserves casing', () => {
      assert.strictEqual(singularize('people'), 'person');
      assert.strictEqual(singularize('People'), 'Person');
    });
  });

  describe('uncountable nouns', () => {
    it('returns unchanged', () => {
      assert.strictEqual(singularize('Sheep'), 'Sheep');
      assert.strictEqual(singularize('Fish'), 'Fish');
      assert.strictEqual(singularize('Software'), 'Software');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      assert.strictEqual(singularize(''), '');
    });

    it('does not singularize words ending in ss, us, is', () => {
      assert.strictEqual(singularize('Class'), 'Class');
      assert.strictEqual(singularize('Status'), 'Status');
      assert.strictEqual(singularize('Basis'), 'Basis');
    });
  });

  describe('round-trip', () => {
    it('pluralize then singularize returns original', () => {
      const words = ['User', 'Category', 'Status', 'Key', 'Person', 'Leaf'];
      for (const word of words) {
        assert.strictEqual(singularize(pluralize(word)), word);
      }
    });
  });
});
