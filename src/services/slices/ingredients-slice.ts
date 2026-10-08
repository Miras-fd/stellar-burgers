import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';

type IngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

const initialState: IngredientsState = {
  items: [],
  isLoading: true,
  error: null,
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  getIngredientsApi
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  selectors: {
    selectIngredients: (state) => state.items,
    selectIngredientById: (state, id: string | undefined) =>
      state.items.find((item) => item._id === id),
    selectIngredientsLoading: (state) => state.isLoading,
    selectIngredientsError: (state) => state.error,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const {
  selectIngredients,
  selectIngredientById,
  selectIngredientsLoading,
  selectIngredientsError,
} = ingredientsSlice.selectors;

export const ingredientsReducer = ingredientsSlice.reducer;
