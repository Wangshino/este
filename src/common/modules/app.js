// @flow
import type { Action, AppState } from '../types';

const ERROR = 'este/app/ERROR';
const STARTED = 'este/app/STARTED';
const ONLINE = 'este/app/ONLINE';
const SHOW_MENU = 'este/app/SHOW_MENU';
const TOGGLE_BASELINE = 'este/app/TOGGLE_BASELINE';
const SET_THEME = 'este/app/SET_THEME';

const initialState = {
  baselineShown: false,
  currentTheme: 'defaultTheme',
  error: null,
  menuShown: false,
  online: false,
  started: false,
};

export const appError = (error: Object): Action => ({
  type: ERROR,
  payload: { error },
});

export const appOnline = (online: boolean): Action => ({
  type: ONLINE,
  payload: { online },
});

export const appShowMenu = (menuShown: boolean): Action => ({
  type: SHOW_MENU,
  payload: { menuShown },
});

export const toggleBaseline = (): Action => ({
  type: TOGGLE_BASELINE,
});

export const setTheme = (theme: string): Action => ({
  type: SET_THEME,
  payload: { theme },
});

const reducer = (state: AppState = initialState, action: Action): AppState => {
  // Map all app errors into state.app.error.
  // In React Native, we show errors in one nicely animated unobtrusive alert.
  // In the browser, we prefer local error messages rendering.
  // TODO: Refactor it. We don't want sticky strings.
  if (action.type.endsWith('_FAIL')) {
    // $FlowFixMe
    state = { ...state, error: action.payload.error };
  }

  switch (action.type) {
    case ERROR:
      return { ...state, error: action.payload.error };

    case SHOW_MENU:
      return { ...state, menuShown: action.payload.menuShown };

    case ONLINE:
      return { ...state, online: action.payload.online };

    case STARTED:
      return { ...state, started: true };

    case TOGGLE_BASELINE:
      return { ...state, baselineShown: !state.baselineShown };

    case SET_THEME:
      return { ...state, currentTheme: action.payload.theme };

    default:
      return state;

  }
};

export default reducer;
