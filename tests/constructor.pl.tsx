import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const apiUrlPattern = '**/api/**';
const harsPath = 'tests/hars';

const accessToken = 'Bearer fake-access-token';
const refreshToken = 'fake-refresh-token';

const bun = {
  id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
};

const anotherBun = {
  id: '643d69a5c3f7b9001cfa093d',
  name: 'Флюоресцентная булка R2-D3',
};

const main = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  calories: '4242',
  proteins: '420',
  fat: '142',
  carbohydrates: '242',
};

const sauce = {
  id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
};

const orderNumber = '98765';

/* Все запросы к бэкенду перехватываются: без записи в HAR-файле запрос
   прерывается и не уходит на реальный сервер. Маршруты, добавленные позже,
   имеют приоритет, поэтому общий перехват регистрируется первым. */
const mockBackend = async (page: Page, harFiles: string[]): Promise<void> => {
  await page.route(apiUrlPattern, (route) => route.abort());

  for (const harFile of harFiles) {
    await page.routeFromHAR(`${harsPath}/${harFile}`, {
      url: apiUrlPattern,
      notFound: 'fallback',
    });
  }
};

const getIngredient = (page: Page, id: string): Locator =>
  page.getByTestId(`ingredient-${id}`);

const addIngredient = async (page: Page, id: string): Promise<void> => {
  await getIngredient(page, id).getByRole('button', { name: 'Добавить' }).click();
};

const getConstructor = (page: Page) => ({
  bunTop: page.getByTestId('constructor-bun-top'),
  bunBottom: page.getByTestId('constructor-bun-bottom'),
  ingredients: page.getByTestId('constructor-ingredients'),
  price: page.getByTestId('constructor-price'),
});

test.describe('добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, ['ingredients.har']);
    await page.goto('/');
    await expect(getIngredient(page, bun.id)).toBeVisible();
  });

  test('конструктор изначально пуст', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await expect(burgerConstructor.bunTop).toHaveText('Выберите булки');
    await expect(burgerConstructor.bunBottom).toHaveText('Выберите булки');
    await expect(burgerConstructor.ingredients).toHaveText('Выберите начинку');
    await expect(burgerConstructor.price).toHaveText('0');
  });

  test('булка добавляется в конструктор сверху и снизу', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, bun.id);

    await expect(burgerConstructor.bunTop).toContainText(`${bun.name} (верх)`);
    await expect(burgerConstructor.bunBottom).toContainText(`${bun.name} (низ)`);
  });

  test('новая булка заменяет ранее добавленную', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, bun.id);
    await addIngredient(page, anotherBun.id);

    await expect(burgerConstructor.bunTop).toContainText(`${anotherBun.name} (верх)`);
    await expect(burgerConstructor.bunBottom).toContainText(`${anotherBun.name} (низ)`);
    await expect(burgerConstructor.bunTop).not.toContainText(bun.name);
  });

  test('начинка и соус добавляются в список ингредиентов', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, main.id);
    await addIngredient(page, sauce.id);

    const constructorItems = burgerConstructor.ingredients.getByRole('listitem');

    await expect(constructorItems).toHaveCount(2);
    await expect(constructorItems.nth(0)).toContainText(main.name);
    await expect(constructorItems.nth(1)).toContainText(sauce.name);
    await expect(burgerConstructor.bunTop).toHaveText('Выберите булки');
  });
});

test.describe('модальное окно с деталями ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, ['ingredients.har']);
    await page.goto('/');
    await getIngredient(page, main.id).getByRole('link').click();
  });

  test('открывается по клику на ингредиент и показывает его данные', async ({
    page,
  }) => {
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(`/ingredients/${main.id}`);
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal.getByRole('heading', { name: main.name })).toBeVisible();
    await expect(modal).toContainText(`Калории, ккал${main.calories}`);
    await expect(modal).toContainText(`Белки, г${main.proteins}`);
    await expect(modal).toContainText(`Жиры, г${main.fat}`);
    await expect(modal).toContainText(`Углеводы, г${main.carbohydrates}`);
    await expect(modal).not.toContainText(bun.name);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await expect(page.getByTestId('modal')).toBeVisible();

    /* Клик в угол оверлея, чтобы не попасть в само модальное окно. */
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по нажатию Escape', async ({ page }) => {
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByTestId('modal')).toHaveCount(0);
  });
});

test.describe('оформление заказа', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: 'accessToken', value: encodeURIComponent(accessToken), url: baseURL },
    ]);
    await page.addInitScript((token) => {
      window.localStorage.setItem('refreshToken', token);
    }, refreshToken);

    await mockBackend(page, ['ingredients.har', 'user.har', 'order.har']);
    await page.goto('/');
    await expect(getIngredient(page, bun.id)).toBeVisible();
  });

  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => window.localStorage.clear());
  });

  test('заказ оформляется, показывается его номер и конструктор очищается', async ({
    page,
  }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, bun.id);
    await addIngredient(page, main.id);
    await addIngredient(page, sauce.id);

    await expect(burgerConstructor.bunTop).toContainText(bun.name);
    await expect(burgerConstructor.ingredients.getByRole('listitem')).toHaveCount(2);

    const orderRequest = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const request = await orderRequest;

    expect(request.headers().authorization).toBe(accessToken);
    expect(request.postDataJSON()).toEqual({
      ingredients: [bun.id, main.id, sauce.id, bun.id],
    });

    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(orderNumber);

    await expect(burgerConstructor.bunTop).toHaveText('Выберите булки');
    await expect(burgerConstructor.bunBottom).toHaveText('Выберите булки');
    await expect(burgerConstructor.ingredients).toHaveText('Выберите начинку');
    await expect(burgerConstructor.price).toHaveText('0');

    await page.getByTestId('modal-close').click();

    await expect(modal).toHaveCount(0);
  });
});
