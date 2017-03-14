// @flow
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import { combineEpics } from 'redux-observable';
import { epics as appEpics } from './modules/app';
import { epics as authEpics } from './modules/auth';
import { epics as usersEpics } from './modules/users';
import { epics as intlEpics } from './modules/intl';

const epics = [...appEpics, ...authEpics, ...usersEpics, ...intlEpics];

const configureEpics = (deps: Object) =>
  (action$: any, { getState }: any) =>
    combineEpics(...epics)(action$, { ...deps, getState });

export default configureEpics;
