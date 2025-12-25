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
    it('changes f to ves for common cases', () => {
      assert.strictEqual(pluralize('Leaf'), 'Leaves');
      assert.strictEqual(pluralize('Half'), 'Halves');
      assert.strictEqual(pluralize('Self'), 'Selves');
      assert.strictEqual(pluralize('Wolf'), 'Wolves');
    });

    it('changes fe to ves for common cases', () => {
      assert.strictEqual(pluralize('Life'), 'Lives');
      assert.strictEqual(pluralize('Wife'), 'Wives');
      assert.strictEqual(pluralize('Knife'), 'Knives');
    });

    it('adds s for -f exceptions', () => {
      assert.strictEqual(pluralize('Roof'), 'Roofs');
      assert.strictEqual(pluralize('Proof'), 'Proofs');
      assert.strictEqual(pluralize('Chief'), 'Chiefs');
      assert.strictEqual(pluralize('Chef'), 'Chefs');
      assert.strictEqual(pluralize('Belief'), 'Beliefs');
      assert.strictEqual(pluralize('Brief'), 'Briefs');
      assert.strictEqual(pluralize('Reef'), 'Reefs');
      assert.strictEqual(pluralize('Gulf'), 'Gulfs');
    });

    it('adds s for -fe exceptions', () => {
      assert.strictEqual(pluralize('Safe'), 'Safes');
      assert.strictEqual(pluralize('Cafe'), 'Cafes');
      assert.strictEqual(pluralize('Giraffe'), 'Giraffes');
      assert.strictEqual(pluralize('Gaffe'), 'Gaffes');
      assert.strictEqual(pluralize('Carafe'), 'Carafes');
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

  describe('nouns ending in consonant + o (exceptions)', () => {
    it('adds s for modern/borrowed words', () => {
      assert.strictEqual(pluralize('Typo'), 'Typos');
      assert.strictEqual(pluralize('Repo'), 'Repos');
      assert.strictEqual(pluralize('Demo'), 'Demos');
      assert.strictEqual(pluralize('Info'), 'Infos');
      assert.strictEqual(pluralize('Disco'), 'Discos');
      assert.strictEqual(pluralize('Casino'), 'Casinos');
      assert.strictEqual(pluralize('Solo'), 'Solos');
      assert.strictEqual(pluralize('Taco'), 'Tacos');
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

    it('handles Latin/Greek -ex/-ix to -ices', () => {
      assert.strictEqual(pluralize('Index'), 'Indices');
      assert.strictEqual(pluralize('Vertex'), 'Vertices');
      assert.strictEqual(pluralize('Matrix'), 'Matrices');
      assert.strictEqual(pluralize('Apex'), 'Apices');
    });

    it('handles Latin -is to -es', () => {
      assert.strictEqual(pluralize('Analysis'), 'Analyses');
      assert.strictEqual(pluralize('Crisis'), 'Crises');
      assert.strictEqual(pluralize('Thesis'), 'Theses');
      assert.strictEqual(pluralize('Basis'), 'Bases');
    });

    it('handles Latin -us to -i', () => {
      assert.strictEqual(pluralize('Focus'), 'Foci');
      assert.strictEqual(pluralize('Radius'), 'Radii');
      assert.strictEqual(pluralize('Nucleus'), 'Nuclei');
      assert.strictEqual(pluralize('Stimulus'), 'Stimuli');
    });

    it('handles Latin -um/-on to -a', () => {
      assert.strictEqual(pluralize('Datum'), 'Data');
      assert.strictEqual(pluralize('Medium'), 'Media');
      assert.strictEqual(pluralize('Criterion'), 'Criteria');
      assert.strictEqual(pluralize('Phenomenon'), 'Phenomena');
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

  describe('compound words (PascalCase/camelCase)', () => {
    it('handles regular compound words', () => {
      assert.strictEqual(pluralize('UserAccount'), 'UserAccounts');
      assert.strictEqual(pluralize('orderItem'), 'orderItems');
      assert.strictEqual(pluralize('DataEntry'), 'DataEntries');
    });

    it('handles compound words with irregular suffixes', () => {
      assert.strictEqual(pluralize('NodeChild'), 'NodeChildren');
      assert.strictEqual(pluralize('UserPerson'), 'UserPeople');
      assert.strictEqual(pluralize('ComputerMouse'), 'ComputerMice');
    });

    it('handles compound words with Latin/Greek suffixes', () => {
      assert.strictEqual(pluralize('DataAnalysis'), 'DataAnalyses');
      assert.strictEqual(pluralize('UserIndex'), 'UserIndices');
      assert.strictEqual(pluralize('NodeCriterion'), 'NodeCriteria');
      assert.strictEqual(pluralize('TableDatum'), 'TableData');
    });

    it('preserves compound words with uncountable suffixes', () => {
      assert.strictEqual(pluralize('UserData'), 'UserData');
      assert.strictEqual(pluralize('UserSoftware'), 'UserSoftware');
      assert.strictEqual(pluralize('NodeMetadata'), 'NodeMetadata');
    });

    it('does not match without uppercase boundary', () => {
      // 'Alice' ends with 'ice' (like 'mice') but should not match
      assert.strictEqual(pluralize('Alice'), 'Alices');
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

    it('handles Latin/Greek -ices to -ex/-ix', () => {
      assert.strictEqual(singularize('Indices'), 'Index');
      assert.strictEqual(singularize('Vertices'), 'Vertex');
      assert.strictEqual(singularize('Matrices'), 'Matrix');
      assert.strictEqual(singularize('Apices'), 'Apex');
    });

    it('handles Latin -es to -is', () => {
      assert.strictEqual(singularize('Analyses'), 'Analysis');
      assert.strictEqual(singularize('Crises'), 'Crisis');
      assert.strictEqual(singularize('Theses'), 'Thesis');
    });

    it('handles Latin -i to -us', () => {
      assert.strictEqual(singularize('Foci'), 'Focus');
      assert.strictEqual(singularize('Radii'), 'Radius');
      assert.strictEqual(singularize('Nuclei'), 'Nucleus');
    });

    it('handles Latin -a to -um/-on', () => {
      // Note: 'Data' is kept as uncountable for programming contexts
      assert.strictEqual(singularize('Media'), 'Medium');
      assert.strictEqual(singularize('Criteria'), 'Criterion');
      assert.strictEqual(singularize('Phenomena'), 'Phenomenon');
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

  describe('singular words ending in s', () => {
    it('preserves words ending in -as', () => {
      assert.strictEqual(singularize('Alias'), 'Alias');
      assert.strictEqual(singularize('Atlas'), 'Atlas');
      assert.strictEqual(singularize('Bias'), 'Bias');
      assert.strictEqual(singularize('Canvas'), 'Canvas');
    });

    it('preserves words ending in -os', () => {
      assert.strictEqual(singularize('Chaos'), 'Chaos');
      assert.strictEqual(singularize('Cosmos'), 'Cosmos');
      assert.strictEqual(singularize('Ethos'), 'Ethos');
    });

    it('preserves tech acronyms', () => {
      assert.strictEqual(singularize('GPS'), 'GPS');
      assert.strictEqual(singularize('AWS'), 'AWS');
      assert.strictEqual(singularize('DNS'), 'DNS');
      assert.strictEqual(singularize('SaaS'), 'SaaS');
      assert.strictEqual(singularize('iOS'), 'iOS');
    });

    it('preserves fields of study', () => {
      assert.strictEqual(singularize('Mathematics'), 'Mathematics');
      assert.strictEqual(singularize('Physics'), 'Physics');
      assert.strictEqual(singularize('Analytics'), 'Analytics');
      assert.strictEqual(singularize('Statistics'), 'Statistics');
      assert.strictEqual(singularize('Graphics'), 'Graphics');
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

  describe('compound words (PascalCase/camelCase)', () => {
    it('handles regular compound words', () => {
      assert.strictEqual(singularize('UserAccounts'), 'UserAccount');
      assert.strictEqual(singularize('orderItems'), 'orderItem');
      assert.strictEqual(singularize('DataEntries'), 'DataEntry');
    });

    it('handles compound words with irregular suffixes', () => {
      assert.strictEqual(singularize('NodeChildren'), 'NodeChild');
      assert.strictEqual(singularize('UserPeople'), 'UserPerson');
      assert.strictEqual(singularize('ComputerMice'), 'ComputerMouse');
    });

    it('handles compound words with Latin/Greek suffixes', () => {
      assert.strictEqual(singularize('DataAnalyses'), 'DataAnalysis');
      assert.strictEqual(singularize('UserIndices'), 'UserIndex');
      assert.strictEqual(singularize('NodeCriteria'), 'NodeCriterion');
    });

    it('preserves compound words with uncountable suffixes', () => {
      assert.strictEqual(singularize('UserData'), 'UserData');
      assert.strictEqual(singularize('UserSoftware'), 'UserSoftware');
      assert.strictEqual(singularize('NodeMetadata'), 'NodeMetadata');
    });

    it('preserves compound words with singular-s suffixes', () => {
      assert.strictEqual(singularize('UserAlias'), 'UserAlias');
      assert.strictEqual(singularize('NodeAnalytics'), 'NodeAnalytics');
      assert.strictEqual(singularize('SystemChaos'), 'SystemChaos');
    });

    it('does not match without uppercase boundary', () => {
      // 'Alice' ends with 'ice' but should not be treated as compound
      assert.strictEqual(singularize('Alice'), 'Alice');
      assert.strictEqual(singularize('Spice'), 'Spice');
    });
  });

  describe('round-trip', () => {
    it('pluralize then singularize returns original', () => {
      const words = ['User', 'Category', 'Status', 'Key', 'Person', 'Leaf'];
      for (const word of words) {
        assert.strictEqual(singularize(pluralize(word)), word);
      }
    });

    it('round-trip works for compound words', () => {
      const words = ['UserAccount', 'NodeChild', 'DataAnalysis', 'UserIndex'];
      for (const word of words) {
        assert.strictEqual(singularize(pluralize(word)), word);
      }
    });
  });
});
