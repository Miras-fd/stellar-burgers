import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from '../constructor-slice';
import { createOrder } from '../order-slice';
import { anotherBunMock, bunMock, mainMock, sauceMock } from './mock-data';

import type { TConstructorState } from '@utils-types';

const requestId = 'test-request-id';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const bun = { ...bunMock, id: 'bun-id' };
const main = { ...mainMock, id: 'main-id' };
const sauce = { ...sauceMock, id: 'sauce-id' };
const secondMain = { ...mainMock, id: 'second-main-id' };

const filledState: TConstructorState = {
  bun,
  ingredients: [main, sauce, secondMain],
};

describe('редьюсер слайса burgerConstructor', () => {
  test('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  test('не изменяет текущее состояние при неизвестном экшене', () => {
    const state = constructorReducer(filledState, { type: 'UNKNOWN' });

    expect(state).toBe(filledState);
  });

  describe('экшен addIngredient', () => {
    test('добавляет булку в поле bun и генерирует уникальный id', () => {
      const state = constructorReducer(initialState, addIngredient(bunMock));

      expect(state.bun).toMatchObject(bunMock);
      expect(typeof state.bun?.id).toBe('string');
      expect(state.ingredients).toEqual([]);
    });

    test('заменяет ранее добавленную булку на новую', () => {
      const state = constructorReducer(filledState, addIngredient(anotherBunMock));

      expect(state.bun).toMatchObject(anotherBunMock);
      expect(state.bun?.id).not.toBe(bun.id);
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    test('добавляет начинку в конец списка ингредиентов', () => {
      const state = constructorReducer(filledState, addIngredient(sauceMock));

      expect(state.bun).toEqual(bun);
      expect(state.ingredients).toHaveLength(filledState.ingredients.length + 1);
      expect(state.ingredients.slice(0, -1)).toEqual(filledState.ingredients);
      expect(state.ingredients.at(-1)).toMatchObject(sauceMock);
      expect(typeof state.ingredients.at(-1)?.id).toBe('string');
    });

    test('присваивает одинаковым ингредиентам разные id', () => {
      const firstState = constructorReducer(initialState, addIngredient(mainMock));
      const state = constructorReducer(firstState, addIngredient(mainMock));

      const [first, second] = state.ingredients;

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('экшен removeIngredient', () => {
    test('удаляет ингредиент по id и сохраняет остальные', () => {
      const state = constructorReducer(filledState, removeIngredient(sauce.id));

      expect(state.ingredients).toEqual([main, secondMain]);
      expect(state.bun).toEqual(bun);
    });

    test('не изменяет список, если ингредиента с таким id нет', () => {
      const state = constructorReducer(filledState, removeIngredient('unknown-id'));

      expect(state.ingredients).toEqual(filledState.ingredients);
    });
  });

  describe('экшен moveIngredient', () => {
    test('перемещает ингредиент вниз', () => {
      const state = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );

      expect(state.ingredients).toEqual([sauce, main, secondMain]);
    });

    test('перемещает ингредиент вверх', () => {
      const state = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 2, toIndex: 1 })
      );

      expect(state.ingredients).toEqual([main, secondMain, sauce]);
    });

    test('не изменяет порядок при перемещении за пределы списка', () => {
      const upState = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 0, toIndex: -1 })
      );
      const downState = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 2, toIndex: 3 })
      );

      expect(upState.ingredients).toEqual(filledState.ingredients);
      expect(downState.ingredients).toEqual(filledState.ingredients);
    });
  });

  test('экшен clearConstructor очищает конструктор', () => {
    const state = constructorReducer(filledState, clearConstructor());

    expect(state).toEqual(initialState);
  });

  describe('асинхронный экшен createOrder', () => {
    const ingredientIds = [bun._id, main._id, sauce._id, secondMain._id, bun._id];

    test('pending: не изменяет состав бургера', () => {
      const state = constructorReducer(
        filledState,
        createOrder.pending(requestId, ingredientIds)
      );

      expect(state).toEqual(filledState);
    });

    test('fulfilled: очищает конструктор после успешного заказа', () => {
      const order = {
        _id: 'order-id',
        status: 'done',
        name: 'Краторный био-марсианский spicy бургер',
        createdAt: '2026-10-08T10:00:00.000Z',
        updatedAt: '2026-10-08T10:00:00.000Z',
        number: 98765,
        ingredients: ingredientIds,
      };

      const state = constructorReducer(
        filledState,
        createOrder.fulfilled(order, requestId, ingredientIds)
      );

      expect(state).toEqual(initialState);
    });

    test('rejected: сохраняет состав бургера при ошибке заказа', () => {
      const state = constructorReducer(
        filledState,
        createOrder.rejected(new Error('Ошибка заказа'), requestId, ingredientIds)
      );

      expect(state).toEqual(filledState);
    });
  });
});
