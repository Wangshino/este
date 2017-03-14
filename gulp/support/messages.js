import sortObject from 'sort-object';

// @flow
// We store messages as code instead of as JSON because JSON sucks.
// - We can use comments, they are useful for translations.
// - Multiline strings ftw.
// - Translations are eslinted.
const descriptorsToMessages = descriptors =>
  descriptors.reduce(
    (previous, { defaultMessage, id }) => ({
      ...previous,
      [id]: defaultMessage,
    }),
    {},
  );

export const messagesToCode = (descriptors: Array<Object>) => {
  const messages = sortObject(descriptorsToMessages(descriptors), {
    sort: (a, b) => a.localeCompare(b),
  });

  const messagesString = JSON.stringify(messages, null, 2)
    // Indent messages.
    .replace(/:\s/g, ':\n    ')
    // Separate messages with blank line
    .replace(/",\n/g, '",\n\n');

  return `/* eslint-disable max-len, quote-props, quotes, comma-dangle */
export default ${messagesString};
`;
};

export const diff = (a: Array<Object>, b: Array<Object>) =>
  a.filter(item => b.indexOf(item) === -1);
