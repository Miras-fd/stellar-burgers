import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';

export type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export type ProtectedRouteState = {
  from?: Location;
};
