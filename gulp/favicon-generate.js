// @flow
import gulp from 'gulp';
import realFavicon from 'gulp-real-favicon';

// Settings were generated online on https://realfavicongenerator.net
// Guide: https://www.npmjs.com/package/gulp-real-favicon
gulp.task('favicon-generate', done => {
  realFavicon.generateFavicon(
    {
      masterPicture: './src/common/manifest/assets/original/favicon.png',
      dest: './src/common/manifest/assets',
      iconsPath: '/assets/manifest',
      design: {
        ios: {
          pictureAspect: 'backgroundAndMargin',
          backgroundColor: '#ffffff',
          margin: '28%',
        },
        desktopBrowser: {},
        windows: {
          pictureAspect: 'noChange',
          backgroundColor: '#2d89ef',
          onConflict: 'override',
        },
        androidChrome: {
          pictureAspect: 'noChange',
          themeColor: '#ffffff',
          manifest: {
            name: 'este',
            display: 'browser',
            orientation: 'notSet',
            onConflict: 'override',
            declared: true,
          },
        },
        safariPinnedTab: {
          pictureAspect: 'silhouette',
          themeColor: '#5bbad5',
        },
      },
      settings: {
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false,
      },
      markupFile: './gulp/support/favicon/favicon-data.json',
    },
    done,
  );
});
