import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import type { Location } from 'react-router-dom';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type LocationState = {
  background?: Location;
};

export type ModalRouteProps = {
  onClose: () => void;
};
