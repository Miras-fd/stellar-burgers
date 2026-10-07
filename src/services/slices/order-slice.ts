import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';

type OrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderData: TOrder | null;
  isOrderDataLoading: boolean;
  error: SerializedError | null;
};

const initialState: OrderState = {
  orderRequest: false,
  orderModalData: null,
  orderData: null,
  isOrderDataLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredientIds: string[]): Promise<TOrder> => {
    const response = await orderBurgerApi(ingredientIds);
    return response.order;
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  'order/fetchOrderByNumber',
  async (orderNumber: number): Promise<TOrder | null> => {
    const response = await getOrderByNumberApi(orderNumber);
    return response.orders[0] ?? null;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
    },
  },
  selectors: {
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderDataLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderDataLoading = false;
        state.orderData = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isOrderDataLoading = false;
        state.error = action.error;
      });
  },
});

export const { clearOrderModalData } = orderSlice.actions;

export const { selectOrderRequest, selectOrderModalData } = orderSlice.selectors;

export const orderReducer = orderSlice.reducer;
