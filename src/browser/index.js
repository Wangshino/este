// @flow
/* eslint-disable react/require-extension */

import 'regenerator-runtime/runtime';
import { loadLocale } from './_intl';

const locale = document.documentElement
  ? document.documentElement.lang
  : 'en';

loadLocale(locale).then(messages =>
  require('./main').default(locale, messages));
