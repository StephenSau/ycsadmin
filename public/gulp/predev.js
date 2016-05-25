
'use strict';

var gulp = require('gulp');
var stylish = require('jshint-stylish');

var $ = require('gulp-load-plugins')();

// Pre-Dev JavaScript files

gulp.task('predev:scripts', function(){
	return gulp.src([
			'bower/angular/angular.js',
			'bower/angular-cookies/angular-cookies.js',
			'bower/angular-ui-router/release/angular-ui-router.js',
			'bower/angular-bootstrap/ui-bootstrap-tpls.js',
			'bower/angular-ui-notification/dist/angular-ui-notification.min.js',
			'bower/angular-datetime/dist/datetime.js',
			'bower/ng-tags-input/ng-tags-input.js',
			// 'scripts/vendor/crypto.js',
			'bower/angular-ui-grid/ui-grid.js',
			'bower/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
			'bower/ng-ueditor/dist/ng-ueditor.min.js'
			// 'js/plugins/ueditor/ng-ueditor.ycs.js'
		])
		.pipe($.ngAnnotate())
		.pipe($.concat('vendor.js'))
		.pipe($.uglify({mangle: true}))
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});

gulp.task('predev:modernizr', function(){
	return gulp.src('bower/modernizr/modernizr.js')
		.pipe($.uglify())
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});

gulp.task('predev:plugin', function(){
	return gulp.src([
			'js/plugins/ueditor/ueditor.config.ycs.js',
			// 'bower/ueditor-bower/ueditor.all.min.js'
			// 'bower/ueditor-bower/ueditor.config.js',
			'js/plugins/ueditor/ueditor.all.ycs.js'	// TEMP Fixes for enableAutoSave: false not working bug in ueditor 1.4.3
		])
		.pipe($.concat('plugin.js'))
		.pipe($.ngAnnotate())
		.pipe($.uglify({mangle: true}))
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});

// Pre-Dev Sass files

gulp.task('predev:scss:bs', function(){
	return gulp.src('bower/bootstrap-sass/assets/stylesheets/**/*.scss')
		.pipe(gulp.dest('scss/bs'))
		.pipe($.filesize());
});

gulp.task('predev:scss:fa', function(){
	return gulp.src('bower/fontawesome/scss/**/*.scss')
		.pipe(gulp.dest('scss/fa'))
		.pipe($.filesize());
});

gulp.task('predev:scss', ['predev:scss:bs', 'predev:scss:fa']);

// Pre-Dev Fonts
gulp.task('predev:fonts', function(){
	return gulp.src([
		'bower/fontawesome/fonts/**',
		'bower/bootstrap-sass/assets/fonts/bootstrap/**',
		'bower/angular-ui-grid/ui-grid.eot',
		'bower/angular-ui-grid/ui-grid.svg',
		'bower/angular-ui-grid/ui-grid.ttf',
		'bower/angular-ui-grid/ui-grid.woff'
		])
		.pipe(gulp.dest('fonts'))
		.pipe($.filesize());
});


// Pre-Dev Main Task
gulp.task('predev', ['predev:scripts', 'predev:modernizr', 'predev:plugin', 'predev:scss', 'predev:fonts']);

// Clean Pre-Dev files
gulp.task('predev:clean', function(){
	return gulp.src(
		[
			'js/vendor.js',
			'js/modernizr.js',
			'js/plugin.js',
			'scss/fa',
			'scss/bs',
			'fonts'
		],	{read: false})
		.pipe($.clean());
});