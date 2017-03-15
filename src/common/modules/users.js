// @flow
import type { Action, UsersState } from '../types';
import { ON_AUTH } from '../modules/auth';
import { compose, last, map, prop, sortBy, values } from 'ramda';

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

const reducer = (
  state: UsersState = initialState,
  action: Action,
): UsersState => {
  switch (action.type) {
    case ON_AUTH: {
      return { ...state };
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
