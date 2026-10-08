import { fetchIngredients, ingredientsReducer } from '../ingredients-slice';
import { ingredientsMock } from './mock-data';

const requestId = 'test-request-id';

const initialState = {
  items: [],
  isLoading: true,
  error: null,
};

describe('редьюсер слайса ingredients', () => {
  test('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  test('не изменяет текущее состояние при неизвестном экшене', () => {
    const currentState = { items: ingredientsMock, isLoading: false, error: null };

    const state = ingredientsReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toBe(currentState);
  });

  describe('асинхронный экшен fetchIngredients', () => {
    test('pending: включает загрузку и сбрасывает ошибку', () => {
      const previousState = {
        items: [],
        isLoading: false,
        error: { message: 'Предыдущая ошибка' },
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.pending(requestId)
      );

      expect(state).toEqual({ items: [], isLoading: true, error: null });
    });

    test('fulfilled: сохраняет ингредиенты и выключает загрузку', () => {
      const state = ingredientsReducer(
        initialState,
        fetchIngredients.fulfilled(ingredientsMock, requestId)
      );

      expect(state).toEqual({ items: ingredientsMock, isLoading: false, error: null });
    });

    test('rejected: сохраняет ошибку и выключает загрузку', () => {
      const errorMessage = 'Не удалось загрузить ингредиенты';

      const state = ingredientsReducer(
        initialState,
        fetchIngredients.rejected(new Error(errorMessage), requestId)
      );

      expect(state.isLoading).toBe(false);
      expect(state.items).toEqual([]);
      expect(state.error?.message).toBe(errorMessage);
    });
  });
});
