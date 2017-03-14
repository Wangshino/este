import fs from 'fs';
import path from 'path';

const loadMessages = options => {
  const {
    includeDefault = false,
  } = options || {};
  const isDictionary = fileName =>
    path.extname(fileName) === '.js' &&
    (includeDefault || !fileName.startsWith('_'));
  return fs
    .readdirSync('messages')
    .filter(isDictionary)
    .map(fileName => ({
      descriptors: require(`../../../messages/${fileName}`).default, // eslint-disable-line import/no-dynamic-require
      locale: fileName.split('.')[0],
    }))
    .reduce(
      (previous, { descriptors, locale }) => ({
        ...previous,
        [locale]: descriptors,
      }),
      {},
    );
};

export default loadMessages;
