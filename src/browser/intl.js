// @flow
import { addLocaleData } from 'react-intl';

const addLocale = (locale, messages, callback) => {
  addLocaleData(locale);
  callback(messages);
};

// Note: require.ensure has to be static analysis friendly or Webpack
// does not bundle properly. The new async import should solve this
// in the future, but currently it does not support named chunks.
// Each language has two chunks, one containing polyfill data if the
// browser needs it, the other just locale data that all browsers need
// Intl is in a separate chunk to save bandwidth switching languages
// in polyfilled browsers. Check the network tab to see it in action.

const localeData = {
  // $FlowFixMe https://github.com/facebook/flow/issues/3217
  en: (callback) => require.ensure([
    'react-intl/locale-data/en',
  ], (require) =>
    addLocale(
      require('react-intl/locale-data/en'),
      {},
    callback), 'en'),

  // $FlowFixMe https://github.com/facebook/flow/issues/3217
  es: (callback) => require.ensure([
    'react-intl/locale-data/es',
    '../../messages/es.js',
  ], (require) =>
    addLocale(
      require('react-intl/locale-data/es'),
      require('../../messages/es.js').default,
    callback), 'es'),
};

export const loadLocale = (locale: string) => new Promise((resolve) => {
  if (!localeData[locale]) {
    locale = 'en';
  }

  if (!window.Intl || window.IntlPolyfill) {
    locale += '_polyfill';
  }

  return localeData[locale](resolve);
});
