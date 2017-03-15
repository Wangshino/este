// @flow

// Algebraic types are composable, so it makes sense to have them at one place.
// blog.ploeh.dk/2016/11/28/easy-domain-modelling-with-types

// Core

export type Deps = {
  FBSDK: any,
  firebase: any,
  firebaseAuth: Function,
  firebaseDatabase: any,
  getState: () => Object,
  getUid: () => string,
  now: () => number,
  uuid: Object,
  validate: (json: Object) => any,
};

// Models

export type Todo = {|
  completed: boolean,
  createdAt: number,
  id: string,
  title: string,
|};

export type User = {|
  displayName: string,
  email: ?string,
  id: string,
  photoURL: ?string,
|};

// Reducers
// We can't use exact object type, because spread is not supported yet.
// We can't use Strict<T> = T & $Shape<T>, because it breaks autocomplete.
// TODO: Wait for Flow.

export type AppState = {
  baselineShown: boolean,
  currentTheme: string,
  error: ?Error,
  menuShown: boolean,
  online: boolean,
  started: boolean,
};

export type AuthState = {
  formDisabled: boolean,
  error: ?Error,
};

export type ConfigState = {
  appName: string,
  appVersion: string,
  firebase: ?Object,
  sentryUrl: string,
};

export type DeviceState = {
  host: string,
};

export type IntlState = {
  currentLocale: ?string,
  defaultLocale: ?string,
  initialNow: ?number,
  locales: ?Array<string>,
  messages: ?Object,
};

export type TodosState = {
  all: { [id: string]: Todo },
};

export type UsersState = {
  online: ?Array<User>,
  viewer: ?User,
};

// State

export type State = {
  app: AppState,
  auth: AuthState,
  config: ConfigState,
  device: DeviceState,
  fields: any,
  found: Object, // found router
  intl: IntlState,
  todos: TodosState,
  users: UsersState,
};

// Actions

export type Action =
  | { type: 'este/app/ERROR', payload: { error: Error } }
  | { type: 'este/app/ONLINE', payload: { online: boolean } }
  | { type: 'este/app/SET_THEME', payload: { theme: string } }
  | { type: 'este/app/SHOW_MENU', payload: { menuShown: boolean } }
  | { type: 'este/app/STARTED' }
  | { type: 'este/app/TOGGLE_BASELINE' }
  | { type: 'este/auth/ON_AUTH', payload: { firebaseUser: ?Object } }
  | { type: 'este/auth/RESET_PASSWORD', payload: { email: string } }
  | { type: 'este/auth/SIGN_IN', payload: { providerName: string, options?: Object } }
  | { type: 'este/auth/SIGN_IN_DONE' }
  | { type: 'este/auth/SIGN_IN_FAIL', payload: { error: Error } }
  | { type: 'este/auth/SIGN_OUT' }
  | { type: 'este/auth/SIGN_UP', payload: { providerName: string, options?: Object } }
  | { type: 'este/auth/SIGN_UP_DONE' }
  | { type: 'este/auth/SIGN_UP_FAIL', payload: { error: Error } }
  | { type: 'este/intl/SET_LOCALE', payload: { locale: string, messages?: Object } }
  | { type: 'este/intl/LOAD_LOCALE', payload: { locale: string } }
  | { type: 'este/todos/ADD_HUNDRED', payload: { todos: Array<Todo> } }
  | { type: 'este/todos/ADD', payload: { todo: Todo } }
  | { type: 'este/todos/CLEAR_COMPLETED' }
  | { type: 'este/todos/CLEAR_ALL' }
  | { type: 'este/todos/DELETE', payload: { id: string } }
  | { type: 'este/todos/TOGGLE_COMPLETED', payload: { todo: Todo } }
  | { type: 'este/users/ON_PRESENCE', payload: { presence: Object } }
  | { type: 'este/users/SAVE_USER_DONE' }
  | { type: 'QUERY_FIREBASE', payload: { ref: string } };
