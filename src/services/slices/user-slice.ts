import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { SerializedError } from '@reduxjs/toolkit';
import type { TUser } from '@utils-types';

type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: SerializedError | null;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

const saveTokens = ({ accessToken, refreshToken }: TokenPair): void => {
  setCookie(accessTokenKey, accessToken);
  localStorage.setItem(refreshTokenKey, refreshToken);
};

const removeTokens = (): void => {
  deleteCookie(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData): Promise<TUser> => {
    const response = await registerUserApi(data);
    saveTokens(response);
    return response.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData): Promise<TUser> => {
    const response = await loginUserApi(data);
    saveTokens(response);
    return response.user;
  }
);

export const fetchUser = createAsyncThunk('user/fetchUser', async (): Promise<TUser> => {
  try {
    const response = await getUserApi();
    return response.user;
  } catch (error) {
    removeTokens();
    throw error;
  }
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>): Promise<TUser> => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async (): Promise<void> => {
  await logoutApi();
  removeTokens();
});

/* Проверка авторизации при старте приложения: если токен есть, запрашиваем
   пользователя. В любом случае после проверки помечаем её как выполненную. */
export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { dispatch }): Promise<void> => {
    if (getCookie(accessTokenKey)) {
      await dispatch(fetchUser());
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectUserError: (state) => state.error,
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.fulfilled, (state) => {
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.isAuthChecked = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const { clearUserError } = userSlice.actions;

export const { selectUser, selectIsAuthChecked, selectUserError } = userSlice.selectors;

export const userReducer = userSlice.reducer;
