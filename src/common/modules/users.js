// @flow
import type { Action, Deps, UsersState } from '../types';
import createUserFirebase from '../lib/createUserFirebase';
import { Observable } from 'rxjs/Observable';
import { appError } from '../modules/app';
import { ON_AUTH, SIGN_IN_DONE, SIGN_UP_DONE } from '../modules/auth';
import { compose, dissoc, last, map, prop, sortBy, values } from 'ramda';

const ON_PRESENCE = 'este/users/ON_PRESENCE';
const SAVE_USER_DONE = 'este/users/SAVE_USER_DONE';

const initialState = {
  online: null,
  viewer: null,
};

export const onUsersPresence = (snap: Object): Action => {
  const presence = snap.val();
  return {
    type: ON_PRESENCE,
    payload: { presence },
  };
};

export const saveUserDone = (): Action => ({
  type: SAVE_USER_DONE,
});

const saveUserEpic = (action$: any, { firebase }: Deps) =>
  Observable.merge(
    action$.filter((action: Action) => action.type === SIGN_IN_DONE),
    action$.filter((action: Action) => action.type === SIGN_UP_DONE),
  ).mergeMap(action => {
    const { email, ...user } = action.payload.user;
    const promise = firebase.update({
      [`users/${user.id}`]: user,
      [`users-emails/${user.id}`]: { email },
    });
    return Observable.from(promise)
      .map(saveUserDone)
      .catch(error => Observable.of(appError(error)));
  });

const usersPresenceEpic = (
  action$: any,
  { firebase, firebaseDatabase }: Deps,
) => {
  const createInfoConnected$ = user =>
    Observable.create(() => {
      let connectionRef;
      const onConnectedValue = snap => {
        const online = snap.val();
        if (!online) return;
        if (connectionRef) connectionRef.remove();
        connectionRef = firebase.child(`users-presence/${user.id}`).push({
          lastSeenAt: firebaseDatabase.ServerValue.TIMESTAMP,
          user: dissoc('email', user),
        });
        connectionRef.onDisconnect().remove();
      };
      firebase.child('.info/connected').on('value', onConnectedValue);
      return () => {
        if (connectionRef) connectionRef.remove();
        firebase.child('.info/connected').off('value', onConnectedValue);
      };
    });

  return (
    action$
      .filter((action: Action) => action.type === ON_AUTH)
      // switchMap unsubscribes previous stream, which is exactly what we want.
      .switchMap(action => {
        const user = createUserFirebase(action.payload.firebaseUser);
        return user ? createInfoConnected$(user) : Observable.of();
      })
  );
};

const reducer = (
  state: UsersState = initialState,
  action: Action,
): UsersState => {
  switch (action.type) {
    case ON_AUTH: {
      const user = createUserFirebase(action.payload.firebaseUser);
      return { ...state, viewer: user };
    }

    case ON_PRESENCE: {
      const { presence } = action.payload;
      if (!presence) {
        return { ...state, online: null };
      }
      const sortBylastSeenAt = sortBy(prop('lastSeenAt'));
      const online = compose(
        map(item => item.user),
        sortBy(sortBylastSeenAt),
        values,
        map(compose(last, sortBylastSeenAt, values)),
      )(presence);
      return { ...state, online };
    }

    default:
      return state;
  }
};

export default reducer;

export const epics = [saveUserEpic, usersPresenceEpic];
