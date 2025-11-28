import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial todos', async ({ page }) => {
    await expect(page.getByText('Learn Propane')).toBeVisible();
    await expect(page.getByText('Build React App')).toBeVisible();
    await expect(page.getByText('1 items left')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const input = page.locator('input[name="text"]');
    await input.fill('New Task');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('New Task')).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    const todoItem = page.getByText('Build React App');
    
    // It starts active (no line-through)
    await expect(todoItem).toHaveCSS('text-decoration', /none/);

    // Click to toggle
    await todoItem.click();

    // Should be completed (line-through)
    await expect(todoItem).toHaveCSS('text-decoration', /line-through/);
    await expect(page.getByText('0 items left')).toBeVisible();

    // Click to toggle back
    await todoItem.click();
    await expect(todoItem).toHaveCSS('text-decoration', /none/);
    await expect(page.getByText('1 items left')).toBeVisible();
  });

  test('should filter todos', async ({ page }) => {
    // Initial state: 1 active ("Build React App"), 1 completed ("Learn Propane")
    
    const filterSelect = page.locator('select');

    // Filter Active
    await filterSelect.selectOption('active');
    await expect(page.getByText('Build React App')).toBeVisible();
    await expect(page.getByText('Learn Propane')).toBeHidden();

    // Filter Completed
    await filterSelect.selectOption('completed');
    await expect(page.getByText('Build React App')).toBeHidden();
    await expect(page.getByText('Learn Propane')).toBeVisible();

    // Filter All
    await filterSelect.selectOption('all');
    await expect(page.getByText('Build React App')).toBeVisible();
    await expect(page.getByText('Learn Propane')).toBeVisible();
  });
});
