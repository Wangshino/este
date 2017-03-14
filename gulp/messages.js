// @flow
/* eslint-disable no-console, no-underscore-dangle */
import gulp from 'gulp';
import fs from 'fs';
import loadMessages from '../src/server/intl/loadMessages';
import config from '../src/server/config';
import { genIntlLoader } from './support/messages';

// const code = messagesToCode(messages);
// fs.writeFileSync('messages/_default.js', code);

// Note: require.ensure has to be static analysis friendly or Webpack
// does not bundle properly. The new async import should solve this
// in the future, but currently it does not support named chunks.
// Each language has two chunks, one containing polyfill data if the
// browser needs it, the other just locale data that all browsers need
// Intl is in a separate chunk to save bandwidth switching languages
// in polyfilled browsers. Check the network tab to see it in action.
gulp.task('messages', ['messages-extract', 'messages-check'], () => {
  const locales = Object.keys(loadMessages());
  const code = genIntlLoader(config.defaultLocale, locales);
  fs.writeFileSync('src/browser/_intl.js', code);
});
