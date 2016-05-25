'use strict';

var gulp = require('gulp');
var stylish = require('jshint-stylish');

var $ = require('gulp-load-plugins')();

gulp.task('scripts:util', function(){
	return gulp.src([
			'scripts/main.js',
			'scripts/ycs/lib/**/*.js',
			'scripts/lib/**/*.js'
		])
		.pipe($.jshint())
		.pipe($.jshint.reporter(stylish))
		.pipe($.concat('util.js'))
		.pipe($.uglify())
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});

gulp.task('scripts:app', function(){
	return gulp.src([
			'scripts/ycs/app.js',
			'scripts/ycs/model/**/*.js',
			'scripts/ycs/directive/**/*.js',
			'scripts/ycs/controller/**/*.js'
		])
		.pipe($.jshint())
		.pipe($.jshint.reporter(stylish))
		.pipe($.concat('app.js'))
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});


gulp.task('css', function(){
	return gulp.src('scss/*.scss')
		.pipe($.rubySass({style:'compressed', 'sourcemap=none': true }))
    .on('error', function (err) { console.log(err.message);})
		.pipe(gulp.dest('css'));
		//.pipe($.filesize());
});

gulp.task('scripts', ['scripts:util', 'scripts:app']);

gulp.task('dev', ['scripts', 'css']);