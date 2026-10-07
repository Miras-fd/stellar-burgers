import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';

type ProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: SerializedError | null;
};

const initialState: ProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const fetchProfileOrders = createAsyncThunk(
  'profileOrders/fetchProfileOrders',
  getOrdersApi
);

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  selectors: {
    selectProfileOrders: (state) => state.orders,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const { selectProfileOrders } = profileOrdersSlice.selectors;

export const profileOrdersReducer = profileOrdersSlice.reducer;
