/**
 * Integration tests for repository relation methods.
 *
 * Tests the full flow: generated relation methods → base repository helpers → database.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createTestPool,
  isDatabaseAvailable,
  logSkipMessage,
  setupTestSchema,
  teardownTestSchema,
} from './test-utils.js';
import { BaseRepository } from '../../src/repository/base-repository.js';
import { deserializeValue } from '../../src/mapping/serializer.js';
import type { Pool } from '../../src/connection/pool.js';
import type { Connection, PoolClient, Transaction } from '../../src/index.js';

// =============================================================================
// Test Types (simulating generated Propane classes)
// =============================================================================

/**
 * These classes simulate generated Propane message types.
 * In real usage, these would be generated from .pmsg files.
 */
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;

  constructor(data: { id: number; name: string; email: string }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
  }
}

class Post {
  readonly id: number;
  readonly title: string;
  readonly authorId: number | null;
  readonly editorId: number | null;

  constructor(data: {
    id: number;
    title: string;
    authorId: number | null;
    editorId: number | null;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.authorId = data.authorId;
    this.editorId = data.editorId;
  }
}

class Category {
  readonly id: number;
  readonly name: string;
  readonly parentId: number | null;

  constructor(data: { id: number; name: string; parentId: number | null }) {
    this.id = data.id;
    this.name = data.name;
    this.parentId = data.parentId;
  }
}

// =============================================================================
// Test Repositories (simulating generated code)
// =============================================================================

/**
 * UserRepository with has-many relation to Post.
 */
class UserRepository extends BaseRepository<User & Record<string, unknown>> {
  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    schemaName: string
  ) {
    super(connection, {
      tableName: 'users',
      schemaName,
      primaryKey: 'id',
      columns: ['id', 'name', 'email'],
      columnTypes: {
        id: 'INTEGER',
        name: 'TEXT',
        email: 'TEXT',
      },
    });
  }

  /**
   * Get all Posts authored by this User.
   * Disambiguated name because Post has multiple FKs to User (author_id, editor_id).
   */
  async getPostsByAuthor(entity: Partial<User>): Promise<Post[]> {
    const rows = await this.queryRelatedMany(
      'posts',
      ['author_id'],
      [entity.id],
      { id: 'INTEGER', title: 'TEXT', author_id: 'INTEGER', editor_id: 'INTEGER' }
    );
    return rows.map(row => this.deserializeAsPost(row));
  }

  /**
   * Get all Posts edited by this User.
   * Disambiguated name because Post has multiple FKs to User (author_id, editor_id).
   */
  async getPostsByEditor(entity: Partial<User>): Promise<Post[]> {
    const rows = await this.queryRelatedMany(
      'posts',
      ['editor_id'],
      [entity.id],
      { id: 'INTEGER', title: 'TEXT', author_id: 'INTEGER', editor_id: 'INTEGER' }
    );
    return rows.map(row => this.deserializeAsPost(row));
  }

  private deserializeAsPost(row: Record<string, unknown>): Post {
    return new Post({
      id: deserializeValue(row['id'], 'INTEGER') as number,
      title: deserializeValue(row['title'], 'TEXT') as string,
      authorId: deserializeValue(row['author_id'], 'INTEGER') as number | null,
      editorId: deserializeValue(row['editor_id'], 'INTEGER') as number | null,
    });
  }
}

/**
 * PostRepository with belongs-to relations to User.
 */
class PostRepository extends BaseRepository<Post & Record<string, unknown>> {
  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    schemaName: string
  ) {
    super(connection, {
      tableName: 'posts',
      schemaName,
      primaryKey: 'id',
      columns: ['id', 'title', 'author_id', 'editor_id'],
      columnTypes: {
        id: 'INTEGER',
        title: 'TEXT',
        author_id: 'INTEGER',
        editor_id: 'INTEGER',
      },
    });
  }

  /**
   * Get the author of this Post.
   */
  async getAuthor(entity: Partial<Post>): Promise<User | null> {
    const row = await this.queryRelatedOne(
      'users',
      ['id'],
      [entity.authorId],
      { id: 'INTEGER', name: 'TEXT', email: 'TEXT' }
    );
    return row ? this.deserializeAsUser(row) : null;
  }

  /**
   * Get the editor of this Post.
   */
  async getEditor(entity: Partial<Post>): Promise<User | null> {
    const row = await this.queryRelatedOne(
      'users',
      ['id'],
      [entity.editorId],
      { id: 'INTEGER', name: 'TEXT', email: 'TEXT' }
    );
    return row ? this.deserializeAsUser(row) : null;
  }

  private deserializeAsUser(row: Record<string, unknown>): User {
    return new User({
      id: deserializeValue(row['id'], 'INTEGER') as number,
      name: deserializeValue(row['name'], 'TEXT') as string,
      email: deserializeValue(row['email'], 'TEXT') as string,
    });
  }
}

/**
 * CategoryRepository with self-referencing relation.
 */
class CategoryRepository extends BaseRepository<
  Category & Record<string, unknown>
> {
  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    schemaName: string
  ) {
    super(connection, {
      tableName: 'categories',
      schemaName,
      primaryKey: 'id',
      columns: ['id', 'name', 'parent_id'],
      columnTypes: {
        id: 'INTEGER',
        name: 'TEXT',
        parent_id: 'INTEGER',
      },
    });
  }

  /**
   * Get the parent category.
   */
  async getParent(entity: Partial<Category>): Promise<Category | null> {
    const row = await this.queryRelatedOne(
      'categories',
      ['id'],
      [entity.parentId],
      { id: 'INTEGER', name: 'TEXT', parent_id: 'INTEGER' }
    );
    return row ? this.deserializeAsCategory(row) : null;
  }

  /**
   * Get child categories.
   */
  async getChildren(entity: Partial<Category>): Promise<Category[]> {
    const rows = await this.queryRelatedMany(
      'categories',
      ['parent_id'],
      [entity.id],
      { id: 'INTEGER', name: 'TEXT', parent_id: 'INTEGER' }
    );
    return rows.map(row => this.deserializeAsCategory(row));
  }

  private deserializeAsCategory(row: Record<string, unknown>): Category {
    return new Category({
      id: deserializeValue(row['id'], 'INTEGER') as number,
      name: deserializeValue(row['name'], 'TEXT') as string,
      parentId: deserializeValue(row['parent_id'], 'INTEGER') as number | null,
    });
  }
}

// =============================================================================
// Tests
// =============================================================================

describe(
  'Repository Relations Integration',
  { skip: !isDatabaseAvailable() },
  () => {
    let pool: Pool;
    let schemaPool: Pool;
    let schemaName: string;
    let userRepo: UserRepository;
    let postRepo: PostRepository;
    let categoryRepo: CategoryRepository;

    before(async () => {
      const testPool = createTestPool();
      if (!testPool) {
        logSkipMessage();
        return;
      }
      pool = testPool;

      schemaName = await setupTestSchema(pool);
      schemaPool = pool.withSchema(schemaName);

      // Create test tables with foreign keys
      await schemaPool.execute(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      )
    `);

      await schemaPool.execute(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        editor_id INTEGER REFERENCES users(id)
      )
    `);

      await schemaPool.execute(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id INTEGER REFERENCES categories(id)
      )
    `);

      // Create repositories
      userRepo = new UserRepository(schemaPool, schemaName);
      postRepo = new PostRepository(schemaPool, schemaName);
      categoryRepo = new CategoryRepository(schemaPool, schemaName);
    });

    after(async () => {
      if (pool) {
        await teardownTestSchema(pool, schemaName);
        await pool.end();
      }
    });

    beforeEach(async () => {
      if (!pool) return;
      // Clear tables in correct order (children first)
      await schemaPool.execute('DELETE FROM posts');
      await schemaPool.execute('DELETE FROM categories');
      await schemaPool.execute('DELETE FROM users');
    });

    // ---------------------------------------------------------------------------
    // Belongs-to Tests
    // ---------------------------------------------------------------------------

    describe('belongs-to relations', () => {
      it('should get related entity via FK', async () => {
        const author = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const post = await postRepo.create({
          title: 'Hello World',
          authorId: author.id,
          editorId: null,
        });

        const fetchedAuthor = await postRepo.getAuthor(post);

        assert.ok(fetchedAuthor);
        assert.strictEqual(fetchedAuthor.id, author.id);
        assert.strictEqual(fetchedAuthor.name, 'Alice');
        assert.strictEqual(fetchedAuthor.email, 'alice@example.com');
      });

      it('should return null when FK is null', async () => {
        const post = await postRepo.create({
          title: 'No Author',
          authorId: null,
          editorId: null,
        });

        const author = await postRepo.getAuthor(post);

        assert.strictEqual(author, null);
      });

      it('should return null when FK references non-existent row', async () => {
        // Temporarily disable FK constraint for this test
        await schemaPool.execute('SET CONSTRAINTS ALL DEFERRED');
        await schemaPool.execute(`
        INSERT INTO posts (title, author_id, editor_id)
        VALUES ('Orphan Post', 99999, NULL)
      `);

        const posts = await postRepo.findAll();
        const orphanPost = posts[0]!;

        const author = await postRepo.getAuthor(orphanPost);

        assert.strictEqual(author, null);
      });

      it('should handle multiple belongs-to relations to same table', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const bob = await userRepo.create({
          name: 'Bob',
          email: 'bob@example.com',
        });

        const post = await postRepo.create({
          title: 'Collaborative Post',
          authorId: alice.id,
          editorId: bob.id,
        });

        const author = await postRepo.getAuthor(post);
        const editor = await postRepo.getEditor(post);

        assert.ok(author);
        assert.ok(editor);
        assert.strictEqual(author.name, 'Alice');
        assert.strictEqual(editor.name, 'Bob');
      });

      it('should return null for editor when editorId is null', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const post = await postRepo.create({
          title: 'No Editor',
          authorId: alice.id,
          editorId: null,
        });

        const editor = await postRepo.getEditor(post);

        assert.strictEqual(editor, null);
      });
    });

    // ---------------------------------------------------------------------------
    // Has-many Tests
    // ---------------------------------------------------------------------------

    describe('has-many relations', () => {
      it('should get all related entities', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        await postRepo.create({
          title: 'Post 1',
          authorId: alice.id,
          editorId: null,
        });
        await postRepo.create({
          title: 'Post 2',
          authorId: alice.id,
          editorId: null,
        });
        await postRepo.create({
          title: 'Post 3',
          authorId: alice.id,
          editorId: null,
        });

        const posts = await userRepo.getPostsByAuthor(alice);

        assert.strictEqual(posts.length, 3);
        const titles = posts.map(p => p.title).toSorted();
        assert.deepStrictEqual(titles, ['Post 1', 'Post 2', 'Post 3']);
      });

      it('should return empty array when no related entities', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const posts = await userRepo.getPostsByAuthor(alice);

        assert.strictEqual(posts.length, 0);
      });

      it('should return empty array when PK is null/undefined', async () => {
        const posts = await userRepo.getPostsByAuthor({
          id: undefined,
        } as Partial<User>);

        assert.strictEqual(posts.length, 0);
      });

      it('should only return related entities, not others', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const bob = await userRepo.create({
          name: 'Bob',
          email: 'bob@example.com',
        });

        await postRepo.create({
          title: 'Alice Post 1',
          authorId: alice.id,
          editorId: null,
        });
        await postRepo.create({
          title: 'Alice Post 2',
          authorId: alice.id,
          editorId: null,
        });
        await postRepo.create({
          title: 'Bob Post 1',
          authorId: bob.id,
          editorId: null,
        });

        const alicePosts = await userRepo.getPostsByAuthor(alice);
        const bobPosts = await userRepo.getPostsByAuthor(bob);

        assert.strictEqual(alicePosts.length, 2);
        assert.strictEqual(bobPosts.length, 1);
        assert.strictEqual(bobPosts[0]!.title, 'Bob Post 1');
      });

      it('should handle multiple has-many relations to same table', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        const bob = await userRepo.create({
          name: 'Bob',
          email: 'bob@example.com',
        });

        // Alice authors, Bob edits
        await postRepo.create({
          title: 'Post 1',
          authorId: alice.id,
          editorId: bob.id,
        });
        // Alice authors, no editor
        await postRepo.create({
          title: 'Post 2',
          authorId: alice.id,
          editorId: null,
        });
        // Bob authors and edits
        await postRepo.create({
          title: 'Post 3',
          authorId: bob.id,
          editorId: bob.id,
        });

        const aliceAuthored = await userRepo.getPostsByAuthor(alice);
        const bobEdited = await userRepo.getPostsByEditor(bob);

        assert.strictEqual(aliceAuthored.length, 2);
        assert.strictEqual(bobEdited.length, 2); // Post 1 and Post 3
      });
    });

    // ---------------------------------------------------------------------------
    // Self-referencing Tests
    // ---------------------------------------------------------------------------

    describe('self-referencing relations', () => {
      it('should get parent entity', async () => {
        const parent = await categoryRepo.create({
          name: 'Electronics',
          parentId: null,
        });

        const child = await categoryRepo.create({
          name: 'Smartphones',
          parentId: parent.id,
        });

        const fetchedParent = await categoryRepo.getParent(child);

        assert.ok(fetchedParent);
        assert.strictEqual(fetchedParent.id, parent.id);
        assert.strictEqual(fetchedParent.name, 'Electronics');
      });

      it('should return null for root category parent', async () => {
        const root = await categoryRepo.create({
          name: 'Root',
          parentId: null,
        });

        const parent = await categoryRepo.getParent(root);

        assert.strictEqual(parent, null);
      });

      it('should get child entities', async () => {
        const parent = await categoryRepo.create({
          name: 'Electronics',
          parentId: null,
        });

        await categoryRepo.create({ name: 'Smartphones', parentId: parent.id });
        await categoryRepo.create({ name: 'Laptops', parentId: parent.id });
        await categoryRepo.create({ name: 'Tablets', parentId: parent.id });

        const children = await categoryRepo.getChildren(parent);

        assert.strictEqual(children.length, 3);
        const names = children.map(c => c.name).toSorted();
        assert.deepStrictEqual(names, ['Laptops', 'Smartphones', 'Tablets']);
      });

      it('should return empty array for leaf category', async () => {
        const leaf = await categoryRepo.create({
          name: 'Leaf',
          parentId: null,
        });

        const children = await categoryRepo.getChildren(leaf);

        assert.strictEqual(children.length, 0);
      });

      it('should handle multi-level hierarchy', async () => {
        const grandparent = await categoryRepo.create({
          name: 'Electronics',
          parentId: null,
        });

        const parent = await categoryRepo.create({
          name: 'Phones',
          parentId: grandparent.id,
        });

        const child = await categoryRepo.create({
          name: 'Smartphones',
          parentId: parent.id,
        });

        // Navigate up
        const fetchedParent = await categoryRepo.getParent(child);
        assert.ok(fetchedParent);
        assert.strictEqual(fetchedParent.name, 'Phones');

        const fetchedGrandparent = await categoryRepo.getParent(fetchedParent);
        assert.ok(fetchedGrandparent);
        assert.strictEqual(fetchedGrandparent.name, 'Electronics');

        const fetchedRoot = await categoryRepo.getParent(fetchedGrandparent);
        assert.strictEqual(fetchedRoot, null);
      });
    });

    // ---------------------------------------------------------------------------
    // Deserialization Tests
    // ---------------------------------------------------------------------------

    describe('deserialization', () => {
      it('should correctly deserialize all column types', async () => {
        const user = await userRepo.create({
          name: 'Test User',
          email: 'test@example.com',
        });

        const post = await postRepo.create({
          title: 'Test Post',
          authorId: user.id,
          editorId: null,
        });

        const fetchedAuthor = await postRepo.getAuthor(post);

        assert.ok(fetchedAuthor);
        assert.strictEqual(typeof fetchedAuthor.id, 'number');
        assert.strictEqual(typeof fetchedAuthor.name, 'string');
        assert.strictEqual(typeof fetchedAuthor.email, 'string');
      });

      it('should handle null FK values in deserialized entities', async () => {
        const user = await userRepo.create({
          name: 'Test',
          email: 'test@example.com',
        });

        await postRepo.create({
          title: 'Test',
          authorId: user.id,
          editorId: null,
        });

        const posts = await userRepo.getPostsByAuthor(user);

        assert.strictEqual(posts.length, 1);
        assert.strictEqual(posts[0]!.editorId, null);
      });
    });

    // ---------------------------------------------------------------------------
    // Edge Cases
    // ---------------------------------------------------------------------------

    describe('edge cases', () => {
      it('should work with partial entity (only FK field)', async () => {
        const author = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        await postRepo.create({
          title: 'Test',
          authorId: author.id,
          editorId: null,
        });

        // Pass only the FK field, not full entity
        const posts = await userRepo.getPostsByAuthor({ id: author.id });

        assert.strictEqual(posts.length, 1);
      });

      it('should handle entity with undefined FK gracefully', async () => {
        const result = await postRepo.getAuthor({
          authorId: undefined,
        } as Partial<Post>);

        assert.strictEqual(result, null);
      });

      it('should handle concurrent relation queries', async () => {
        const alice = await userRepo.create({
          name: 'Alice',
          email: 'alice@example.com',
        });

        await postRepo.create({
          title: 'Post 1',
          authorId: alice.id,
          editorId: null,
        });
        await postRepo.create({
          title: 'Post 2',
          authorId: alice.id,
          editorId: null,
        });

        // Run multiple queries concurrently
        const [posts1, posts2, posts3] = await Promise.all([
          userRepo.getPostsByAuthor(alice),
          userRepo.getPostsByAuthor(alice),
          userRepo.getPostsByAuthor(alice),
        ]);

        assert.strictEqual(posts1.length, 2);
        assert.strictEqual(posts2.length, 2);
        assert.strictEqual(posts3.length, 2);
      });
    });
  }
);
