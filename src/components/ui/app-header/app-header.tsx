import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import clsx from 'clsx';
import { Link, NavLink } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

type TNavLinkState = {
  isActive: boolean;
};

const getLinkClassName = ({ isActive }: TNavLinkState): string =>
  clsx(styles.link, isActive && styles.link_active);

const getIconType = (isActive: boolean): 'primary' | 'secondary' =>
  isActive ? 'primary' : 'secondary';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={clsx(styles.menu, 'p-4')}>
      <div className={styles.menu_part_left}>
        <NavLink to="/" end className={getLinkClassName}>
          {({ isActive }) => (
            <>
              <BurgerIcon type={getIconType(isActive)} />
              <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
            </>
          )}
        </NavLink>
        <NavLink to="/feed" className={getLinkClassName}>
          {({ isActive }) => (
            <>
              <ListIcon type={getIconType(isActive)} />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </>
          )}
        </NavLink>
      </div>
      <Link to="/" className={styles.logo}>
        <Logo className="" />
      </Link>
      <div className={styles.link_position_last}>
        <NavLink to="/profile" className={getLinkClassName}>
          {({ isActive }) => (
            <>
              <ProfileIcon type={getIconType(isActive)} />
              <p className="text text_type_main-default ml-2">
                {userName ?? 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  </header>
);
