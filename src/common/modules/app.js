// @flow
import type { Action, Deps, AppState } from '../types';
import isReactNative from '../lib/isReactNative';
import { Actions as FarceActions } from 'farce';
import { Observable } from 'rxjs/Observable';
import { onAuth, signInDone, signInFail } from '../modules/auth';

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

const appStartedEpic = (action$: any, deps: Deps) => {
  const { firebase, firebaseAuth, getState } = deps;

  const appOnline$ = Observable.create(observer => {
    const onValue = snap => {
      const online = snap.val();
      if (online === getState().app.online) return;
      observer.next(appOnline(online));
    };
    firebase.child('.info/connected').on('value', onValue);
    return () => {
      firebase.child('.info/connected').off('value', onValue);
    };
  });

  const maybeUpdatePathnameOnAuthChange = firebaseUser => {
    const { pathname } = getState().found.match.location;
    const isSignIn = firebaseUser && pathname === '/signin';
    return FarceActions.replace(isSignIn ? '/' : pathname);
  };

  // firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged
  const onAuth$ = Observable.create(observer => {
    const unsubscribe = firebaseAuth().onAuthStateChanged(firebaseUser => {
      observer.next(onAuth(firebaseUser));
      if (!isReactNative) {
        observer.next(maybeUpdatePathnameOnAuthChange(firebaseUser));
      }
    });
    return unsubscribe;
  });

  const signInAfterRedirect$ = Observable.create(observer => {
    let unsubscribed = false;
    firebaseAuth()
      .getRedirectResult()
      .then(({ user: firebaseUser }) => {
        if (unsubscribed || !firebaseUser) return;
        observer.next(signInDone(firebaseUser));
      })
      .catch(error => {
        if (unsubscribed) return;
        observer.error(signInFail(error));
      });
    return () => {
      unsubscribed = true;
    };
  });

  const streams: Array<any> = [appOnline$, onAuth$];

  if (process.env.IS_BROWSER) {
    streams.push(signInAfterRedirect$);
  }

  return action$
    .filter((action: Action) => action.type === STARTED)
    .mergeMap(() => Observable.merge(...streams));
};

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

export const epics = [appStartedEpic];
