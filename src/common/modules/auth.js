// @flow
import type { Action, Deps, AuthState } from '../types';
import invariant from 'invariant';
import createUserFirebase from '../lib/createUserFirebase';
import isReactNative from '../lib/isReactNative';
import isMobileFacebookApp from '../lib/isMobileFacebookApp';
import firebaseMessages from '../messages/firebase';
import { Actions as FarceActions } from 'farce';
import { Observable } from 'rxjs/Observable';
import { ValidationError } from '../lib/validation';

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

export const onAuth = (firebaseUser: ?Object): Action => ({
  type: ON_AUTH,
  payload: { firebaseUser },
});

export const resetPassword = (email: string): Action => ({
  type: RESET_PASSWORD,
  payload: { email },
});

export const signIn = (providerName: string, options?: Object): Action => ({
  type: SIGN_IN,
  payload: { providerName, options },
});

export const signInDone = (firebaseUser: Object): Action => ({
  type: SIGN_IN_DONE,
  payload: {
    user: createUserFirebase(firebaseUser),
  },
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

export const signUpDone = (firebaseUser: Object): Action => ({
  type: SIGN_UP_DONE,
  payload: {
    user: createUserFirebase(firebaseUser),
  },
});

export const signUpFail = (error: Error): Action => ({
  type: SIGN_UP_FAIL,
  payload: { error },
});

const validateEmailAndPassword = (validate, fields) =>
  validate(fields)
    .prop('email')
    .required()
    .email()
    .prop('password')
    .required()
    .simplePassword().promise;

const mapFirebaseErrorToEsteValidationError = code => {
  const prop = {
    'auth/email-already-in-use': 'email',
    'auth/invalid-email': 'email',
    'auth/user-not-found': 'email',
    'auth/wrong-password': 'password',
  }[code];
  return new ValidationError(code, { prop });
};

const resetPasswordEpic = (action$: any, { firebaseAuth }: Deps) =>
  action$
    .filter((action: Action) => action.type === RESET_PASSWORD)
    .mergeMap(({ payload: { email } }) => {
      firebaseAuth().sendPasswordResetEmail(email);
      return Observable.of();
    });

const facebookPermissions = ['email', 'public_profile', 'user_friends'];

const signInEpic = (action$: any, { FBSDK, firebaseAuth, validate }: Deps) => {
  const signInWithEmailAndPassword = options => {
    const { email, password } = options;
    const promise = validateEmailAndPassword(validate, {
      email,
      password,
    }).then(() => firebaseAuth().signInWithEmailAndPassword(email, password));
    return Observable.from(promise)
      .map(firebaseUser => signInDone(firebaseUser))
      .catch(error => {
        if (firebaseMessages[error.code]) {
          error = mapFirebaseErrorToEsteValidationError(error.code);
        }
        return Observable.of(signInFail(error));
      });
  };

  const signInWithRedirect = provider =>
    Observable.from(firebaseAuth().signInWithRedirect(provider))
      .mergeMap(() => Observable.of()) // Don't return anything on redirect.
      .catch(error => Observable.of(signInFail(error)));

  const signInWithPopup = provider =>
    Observable.from(firebaseAuth().signInWithPopup(provider))
      .map(userCredential => signInDone(userCredential.user))
      .catch(error => {
        if (error.code === 'auth/popup-blocked') {
          return signInWithRedirect(provider);
        }
        return Observable.of(signInFail(error));
      });

  const nativeSignIn = () =>
    Observable.from(
      FBSDK.LoginManager.logInWithReadPermissions(facebookPermissions),
    )
      .mergeMap(result => {
        if (result.isCancelled) {
          // Mimic Firebase error to have the same universal API.
          const error: any = new Error('auth/popup-closed-by-user');
          error.code = 'auth/popup-closed-by-user';
          throw error;
        }
        return Observable.from(FBSDK.AccessToken.getCurrentAccessToken());
      })
      .mergeMap(({ accessToken }) => {
        const facebookCredential = firebaseAuth.FacebookAuthProvider.credential(
          accessToken.toString(),
        );
        return Observable.from(
          firebaseAuth().signInWithCredential(facebookCredential),
        );
      })
      .map(firebaseUser => signInDone(firebaseUser))
      .catch(error => Observable.of(signInFail(error)));

  return action$
    .filter((action: Action) => action.type === SIGN_IN)
    .mergeMap(({ payload: { providerName, options } }) => {
      if (options && options.isNative) {
        return nativeSignIn('facebook');
      }
      if (providerName === 'password') {
        return signInWithEmailAndPassword(options);
      }
      // TODO: Add more providers.
      invariant(
        providerName === 'facebook',
        `${providerName} provider not supported.`,
      );
      const provider = new firebaseAuth.FacebookAuthProvider();
      // Remember, users can revoke anything.
      provider.addScope(facebookPermissions.join(','));
      if (isMobileFacebookApp()) {
        return signInWithRedirect(provider);
      }
      return signInWithPopup(provider);
    });
};

const signUpEpic = (action$: any, { firebaseAuth, validate }: Deps) =>
  action$.filter((action: Action) => action.type === SIGN_UP).mergeMap(({
    payload: { providerName, options },
  }) => {
    invariant(
      providerName === 'password',
      `${providerName} provider not supported.`,
    );
    const { email, password } = options;
    const promise = validateEmailAndPassword(validate, {
      email,
      password,
    }).then(() =>
      firebaseAuth().createUserWithEmailAndPassword(email, password));
    return Observable.from(promise)
      .map(firebaseUser => signUpDone(firebaseUser))
      .catch(error => {
        if (firebaseMessages[error.code]) {
          error = mapFirebaseErrorToEsteValidationError(error.code);
        }
        return Observable.of(signUpFail(error));
      });
  });

const signOutEpic = (action$: any, { firebaseAuth }: Deps) =>
  action$
    .filter((action: Action) => action.type === SIGN_OUT)
    .mergeMap(() => {
      firebaseAuth().signOut();
      return isReactNative
        ? Observable.of()
        : Observable.of(FarceActions.push('/'));
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

export const epics = [resetPasswordEpic, signInEpic, signUpEpic, signOutEpic];
