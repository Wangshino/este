// @flow

import type { Deps, State } from './types';
import validate from './validate';

const configureDeps = (initialState: State, platformDeps: Deps) => ({
  ...platformDeps,
  getUid: () => platformDeps.uuid.v4(),
  now: () => Date.now(),
  validate,
});

export default configureDeps;
