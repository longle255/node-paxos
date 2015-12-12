const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const del = require('del');
const path = require('path');
const mkdirp = require('mkdirp');
const isparta = require('isparta');
const exec = require('child_process').exec;
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const manifest = require('./package.json');
const config = manifest.nodeBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);

// Remove the built files
gulp.task('clean', function(cb) {
  del([destinationFolder], cb);
});

// Send a notification when JSHint fails,
// so that you know your changes didn't build
function jshintNotify(file) {
  if (!file.jshint) {
    return;
  }
  return file.jshint.success ? false : 'JSHint failed';
}

function jscsNotify(file) {
  if (!file.jscs) {
    return;
  }
  return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failOnError())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify));
  });
}

// Lint our source code
createLintTask('lint-src', ['src/**/*.js']);

// Lint our test code
createLintTask('lint-test', ['test/**/*.js']);

// Build two versions of the library
gulp.task('build', ['lint-src', 'clean'], function() {

  // Create our output directory
  mkdirp.sync(destinationFolder);
  return gulp.src('src/**/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest(destinationFolder));
});

function test() {
  return gulp.src(['test/init.test.js', 'test/unit/**/*.js'], {
      read: false
    })
    .pipe($.plumber())
    .pipe($.mocha({
      reporter: 'spec',
      globals: [
        'stub',
        'spy',
        'expect'
      ],
      timeout: 10000
    }));
}

// Make babel preprocess the scripts the user tries to import from here on.
require('babel-core/register');

gulp.task('coverage', function(done) {
  gulp.src(['src/*.js'])
    .pipe($.plumber())
    .pipe($.istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
});

// Compile ES6 to ES5
gulp.task('babel-dist', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe($.babel())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: function(file) {
        return path.relative(file.path, __dirname);
      }
    }))
    .pipe(gulp.dest('dist'));
});

// Lint and run our tests
gulp.task('test', ['lint-src', 'lint-test'], test);

// Run the headless unit tests as you make changes.
gulp.task('watch', ['test'], function() {
  gulp.watch(['src/**/*', 'test/**/*', 'package.json', '**/.jshintrc', '.jscsrc'], ['test']);
});

// An alias of test
gulp.task('default', ['test']);
