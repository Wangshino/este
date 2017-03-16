// @flow
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';
import autoprefixer from 'autoprefixer';
import config from '../src/server/config';
import constants from './constants';
import ip from 'ip';
import path from 'path';
import webpack from 'webpack';
import webpackIsomorphicAssets from './assets';

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(
  webpackIsomorphicAssets,
);

const loaders = {
  css: '',
};

const serverIp = config.remoteHotReload
  ? ip.address() // Dynamic IP address enables hot reload on remote devices.
  : 'localhost';

// $FlowFixMe
const makeConfig = options => {
  const { isDevelopment } = options;
  const stylesLoaders = Object.keys(loaders).map(ext => {
    const prefix = 'css-loader!postcss-loader';
    const extLoaders = prefix + loaders[ext];
    const loader = isDevelopment
      ? `style-loader!${extLoaders}`
      : ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: extLoaders,
        });
    return {
      test: new RegExp(`\\.(${ext})$`),
      use: loader,
    };
  });

  return {
    cache: isDevelopment,
    devtool: isDevelopment
      ? config.developmentSourceMap
      : config.productionSourceMap,
    entry: {
      app: isDevelopment
        ? [
            `webpack-hot-middleware/client?path=http://${serverIp}:${constants.HOT_RELOAD_PORT}/__webpack_hmr`,
            path.join(constants.SRC_DIR, 'browser/index.js'),
          ]
        : [path.join(constants.SRC_DIR, 'browser/index.js')],
    },
    module: {
      noParse: [
        // https://github.com/localForage/localForage/issues/617
        /localforage\.js/,
      ],
      rules: [
        {
          test: /\.(gif|jpg|png|svg)(\?.*)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        },
        {
          test: /favicon\.ico$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 1,
            },
          },
        },
        {
          test: /\.(ttf|eot|woff|woff2)(\?.*)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 100000,
            },
          },
        },
        {
          test: /\.js$/,
          exclude: constants.NODE_MODULES_DIR,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [['env', { modules: false }], 'react', 'stage-1'],
              plugins: [
                'ramda',
                'lodash',
                // ['inferno', { imports: true }],
              ],
              env: {
                production: {
                  plugins: ['transform-react-constant-elements'],
                },
              },
            },
          },
        },
        ...stylesLoaders,
      ],
    },
    output: isDevelopment
      ? {
          path: constants.BUILD_DIR,
          filename: '[name].js',
          chunkFilename: '[name]-[chunkhash].js',
          publicPath: `http://${serverIp}:${constants.HOT_RELOAD_PORT}/build/`,
        }
      : {
          path: constants.BUILD_DIR,
          filename: '[name]-[hash].js',
          chunkFilename: '[name]-[chunkhash].js',
          publicPath: '/assets/',
        },
    plugins: (() => {
      const plugins = [
        new webpack.LoaderOptionsPlugin({
          minimize: !isDevelopment,
          debug: isDevelopment,
          // Webpack 2 no longer allows custom properties in configuration.
          // Loaders should be updated to allow passing options via loader options in module.rules.
          // Alternatively, LoaderOptionsPlugin can be used to pass options to loaders
          hotPort: constants.HOT_RELOAD_PORT,
          postcss: () => [autoprefixer({ browsers: 'last 2 version' })],
        }),
        new webpack.DefinePlugin({
          'process.env': {
            IS_BROWSER: true, // Because webpack is used only for browser code.
            IS_SERVERLESS: JSON.stringify(process.env.IS_SERVERLESS || false),
            NODE_ENV: JSON.stringify(
              isDevelopment ? 'development' : 'production',
            ),
          },
        }),
      ];
      if (isDevelopment) {
        plugins.push(
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoEmitOnErrorsPlugin(),
          webpackIsomorphicToolsPlugin.development(),
        );
      } else {
        plugins.push(
          // Render styles into separate cacheable file to prevent FOUC and
          // optimize for critical rendering path.
          new ExtractTextPlugin({
            filename: 'app-[hash].css',
            disable: false,
            allChunks: true,
          }),
          new LodashModuleReplacementPlugin(),
          new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
              screw_ie8: true, // eslint-disable-line camelcase
              warnings: false, // Because uglify reports irrelevant warnings.
            },
          }),
          new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
          }),
          webpackIsomorphicToolsPlugin,
          new CopyWebpackPlugin(
            [
              {
                from: './src/common/manifest/assets/',
                to: 'manifest',
              },
            ],
            {
              ignore: ['original/**'],
            },
          ),
        );
      }
      return plugins;
    })(),
    performance: {
      hints: false,
      // TODO: Reenable it once Webpack 2 will complete dead code removing.
      // hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    },
    resolve: {
      extensions: ['.js'], // .json is ommited to ignore ./firebase.json
      modules: [constants.SRC_DIR, 'node_modules'],
      alias: {
        react$: require.resolve(path.join(constants.NODE_MODULES_DIR, 'react')),
      },
    },
  };
};

export default makeConfig;
