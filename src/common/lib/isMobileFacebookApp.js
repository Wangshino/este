// @flow

const isMobileFacebookApp = () => {
  if (typeof navigator !== 'object') {
    return false;
  }

  const ua = navigator.userAgent || navigator.vendor; // eslint-disable-line no-undef
  return ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
};

export default isMobileFacebookApp;
