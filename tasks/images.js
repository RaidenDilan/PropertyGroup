const gulp        = require('gulp');
const clean       = require('gulp-clean');
const eventStream = require('event-stream');
const imagemin    = require('gulp-imagemin');
const browserSync = require('browser-sync');
const gulpIf      = require('gulp-if');
const config      = require('../package').gulp;

const cleanImages = () => {
  return gulp
    .src(config.dest.images, { read: false }) // set true to read the content inside *{png,jpg,jpeg,gif,ico,svg} files
    .pipe(clean());
};

const copyImages = () => {
  return gulp
    .src(`${config.src.images}${config.selectors.images}`)
    // .pipe(imagemin()
    .pipe(gulpIf(global.prodocution, imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
      // svgoPlugins: [{ removeViewBox: true },  { cleanupIDs: false }]
    })))
    .pipe(gulp.dest(config.dest.images));
};

const buildImages = () => {
  return eventStream.merge(
    cleanImages(),
    copyImages()
  )
  .pipe(browserSync.stream());
};

gulp.task('build-images', buildImages);
module.exports = buildImages;
