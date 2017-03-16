// @flow
import type { Action, AuthState } from '../types';

export const ON_AUTH = 'este/auth/ON_AUTH';
const RESET_PASSWORD = 'este/auth/RESET_PASSWORD';
const SIGN_IN = 'este/auth/SIGN_IN';
export const SIGN_IN_DONE = 'este/auth/SIGN_IN_DONE';
const SIGN_IN_FAIL = 'este/auth/SIGN_IN_FAIL';
const SIGN_UP = 'este/auth/SIGN_UP';
export const SIGN_UP_DONE = 'este/auth/SIGN_UP_DONE';
const SIGN_UP_FAIL = 'este/auth/SIGN_UP_FAIL';
const SIGN_OUT = 'este/auth/SIGN_OUT';

const initialState = {
  formDisabled: false,
  error: null,
};

export const onAuth = (user: ?Object): Action => ({
  type: ON_AUTH,
  payload: { user },
});

export const resetPassword = (email: string): Action => ({
  type: RESET_PASSWORD,
  payload: { email },
});

export const signIn = (providerName: string, options?: Object): Action => ({
  type: SIGN_IN,
  payload: { providerName, options },
});

export const signInDone = (): Action => ({
  type: SIGN_IN_DONE,
});

export const signInFail = (error: Error): Action => ({
  type: SIGN_IN_FAIL,
  payload: { error },
});

export const signOut = (): Action => ({
  type: SIGN_OUT,
});

export const signUp = (providerName: string, options?: Object): Action => ({
  type: SIGN_UP,
  payload: { providerName, options },
});

export const signUpDone = (): Action => ({
  type: SIGN_UP_DONE,
});

export const signUpFail = (error: Error): Action => ({
  type: SIGN_UP_FAIL,
  payload: { error },
});

const reducer = (
  state: AuthState = initialState,
  action: Action,
): AuthState => {
  switch (action.type) {
    case SIGN_IN:
    case SIGN_UP: {
      return { ...state, formDisabled: true };
    }

    case SIGN_IN_DONE:
    case SIGN_UP_DONE: {
      return { ...state, formDisabled: false, error: null };
    }

    case SIGN_IN_FAIL:
    case SIGN_UP_FAIL: {
      return { ...state, formDisabled: false, error: action.payload.error };
    }

    default:
      return state;

  }
};

export default reducer;
