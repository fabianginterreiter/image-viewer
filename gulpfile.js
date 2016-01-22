var gulp = require('gulp');
var concat = require('gulp-concat')
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var bowerFiles = require('main-bower-files');
var es = require('event-stream');
var sort = require('sort-stream');
var order = require("gulp-order");
var jshint = require('gulp-jshint');
var prettify = require('gulp-jsbeautifier');

gulp.task('format-js-app', function() {
  gulp.src(['client/app/**/*.js'])
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest('client/app'))
});

gulp.task('format-js-router', function() {
  gulp.src(['router/*.js'])
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest('router'))
});

gulp.task('format-js', ['format-js-app', 'format-js-router']);

gulp.task('format-html', function() {
  gulp.src('client/**/*.html')
    .pipe(prettify({indentSize: 2}))
    .pipe(gulp.dest('./client'))
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


gulp.task('lint', function() {
  return gulp.src(['client/app/**/*.js', 'routes/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*gulp.task('index', function () {
  var target = gulp.src('./src/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths: 
  var sources = gulp.src(['./src/*.js', './src/**.css'], {read: false});
 
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./src'));
});*/

gulp.task('clean', function () {
    return gulp.src('./public', {read: false})
        .pipe(clean());
});

gulp.task('bower', ['clean'], function() {
  gulp.src(bowerFiles({filter:function(p) {
    return p.endsWith('js');
  }})).pipe(gulp.dest('./public/vendor/js'));

  gulp.src(bowerFiles({filter:function(p) {
    return p.endsWith('css');
  }})).pipe(gulp.dest('./public/vendor/css'));

  gulp.src(bowerFiles({filter:function(p) {
    return p.endsWith('eot') || p.endsWith('svg') || p.endsWith('ttf') || p.endsWith('woff') || p.endsWith('woff2');
  }})).pipe(gulp.dest('./public/vendor/fonts'));
});

gulp.task('templates', ['clean'], function() {
  return gulp.src('./client/templates/**/*.html').pipe(gulp.dest('./public/templates'));
});

gulp.task('stylesheet', ['clean'], function() {
  return gulp.src('./client/stylesheets/*.css').pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('javascript', ['clean'], function() {
  return gulp.src("./client/app/**/*.js").pipe(gulp.dest("./public/app"));
});

gulp.task('images', ['clean'], function() {
  return gulp.src('./client/images/**/*.*').pipe(gulp.dest('./public/images'));
});

gulp.task('index', ['javascript', 'stylesheet', 'bower', 'images'], function() {
  gulp.src('./client/index.html')
  .pipe(inject(gulp.src(['vendor/**/*.*'], { cwd: 'public/'}).pipe(order([
    "*/jquery.js",
    "*/bootstrap.min.js",
    "*/ng-tags-input.min.css",
    "*/angular.js",
    "*"
  ])), {name: 'vendor'}))
  .pipe(inject(gulp.src(['app/**/*.js', 'stylesheets/**/*.css'], { cwd: 'public/'}).pipe(order([
    "app/app.module.js",
    "app/**/*.js"
  ])), {name: 'app'}))
  .pipe(gulp.dest('./public'));
});

gulp.task('default', ['index', 'templates']);

gulp.task('watch', function() {
  return gulp.watch('client/**/*.*', ['default']);
});