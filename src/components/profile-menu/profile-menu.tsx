import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { logoutUser } from '@services/slices/user-slice';
import { useDispatch } from '@services/store';

const loginPath = '/login';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    void dispatch(logoutUser()).then((action) => {
      if (logoutUser.fulfilled.match(action)) {
        void navigate(loginPath, { replace: true });
      }
    });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
