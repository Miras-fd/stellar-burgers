import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';
type MoveIngredientPayload = {
  fromIndex: number;
  toIndex: number;
};
const bunType = 'bun';
const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};
const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === bunType) {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    moveIngredient: (state, action: PayloadAction<MoveIngredientPayload>) => {
      const { fromIndex, toIndex } = action.payload;
      if (toIndex < 0 || toIndex >= state.ingredients.length) {
        return;
      }
      const [movedIngredient] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, movedIngredient);
    },
    clearConstructor: () => initialState,
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
});
export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;
export const { selectConstructorItems } = constructorSlice.selectors;
export const constructorReducer = constructorSlice.reducer;
