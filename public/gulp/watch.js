'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

gulp.task('clean', function(){
	return gulp.src(
		['.dist'],	{read: false})
		.pipe($.clean());
});

gulp.task('deepclean', function(){
	return gulp.src(
		['.development', '.dist', 'zip'],	{read: false})
		.pipe($.clean());
});

gulp.task('watch', ['dev'], function(){
	gulp.watch('scripts/**/*', ['scripts:app']);
	gulp.watch('scss/**/*.scss', ['css']);
});