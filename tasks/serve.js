const gulp        = require('gulp');
const nodemon     = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const config      = require('../package').gulp;
// const { env }     = require('./config/environment');

const serve = () => {
  let started = false;

  browserSync.init(null, {
    proxy: 'http://localhost:4000',
    files: ['public/**/*.*'],
    browser: 'google chrome',
    port: 7000,
    reloadDelay: 1000
  });

  return nodemon({
    script: config.main.server,
    ignore: [config.destDir, config.srcDir],
    env: { NODE_ENV: 'development' }
    // env: { env: 'development' }
  })
  .on('start', () => {
    if (!started) {
      browserSync.reload();
    } else {
      started = false;
    }
  });
};

gulp.task('serve', serve);
module.exports = serve;
