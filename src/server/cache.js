// @flow

import componentOptimization from 'react-ssr-optimization';

// const simpleCache = props => `${props.name}`;
// const propCache = props => JSON.stringify(props);

componentOptimization({
  components: {
    // Serve same exact component for all users
    // HomePage: simpleCache,
    // Cache component based on all props supplied
    // NotFoundPage: propCache,
  },
  lruCacheSettings: {
    max: 500,
  },
  // eventCallback: console.log,
  // collectLoadTimeStats: true,
});
