'use strict';

var gulp = require('gulp');
var stylish = require('jshint-stylish');

var $ = require('gulp-load-plugins')();

gulp.task('dist:app', function(){
	return gulp.src([
			'scripts/ycs/app.js',
			'scripts/ycs/model/**/*.js',
			'scripts/ycs/directive/**/*.js',
			'scripts/ycs/controller/**/*.js'
		])
		.pipe($.jshint())
		.pipe($.jshint.reporter(stylish))
		.pipe($.concat('app.js'))
		.pipe($.ngAnnotate())
		.pipe($.uglify({mangle: true}))
		.pipe(gulp.dest('js'))
		.pipe($.filesize());
});

// Cache Buster for QA

gulp.task('rev:reset:login', function(){
	return gulp.src('../index.html')
		.pipe($.justReplace([
		  {
		  	search: /\?t\=\d{13}/g,
		  	replacement: '?t=%YCSTIMESTAMP%'
		  }
		]))
		.pipe(gulp.dest('../.'));
});

gulp.task('rev:reset:app', function(){
	return gulp.src('../app/index.html')
		.pipe($.justReplace([
		  {
		  	search: /\?t\=\d{13}/g,
		  	replacement: '?t=%YCSTIMESTAMP%'
		  }
		]))
		.pipe(gulp.dest('../app'));
});

gulp.task('rev:reset', ['rev:reset:login', 'rev:reset:app']);

gulp.task('rev:timestamp:login', function(){
	return gulp.src('../index.html')
		.pipe($.justReplace([
		  {
		    search: /%YCSTIMESTAMP%/g,
		    replacement: (new Date()).getTime()
		  }
		]))
		.pipe(gulp.dest('../.'));
});

gulp.task('rev:timestamp:app', function(){
	return gulp.src('../app/index.html')
		.pipe($.justReplace([
		  {
		    search: /%YCSTIMESTAMP%/g,
		    replacement: (new Date()).getTime()
		  }
		]))
		.pipe(gulp.dest('../app'));
});

gulp.task('rev:timestamp',  ['rev:timestamp:login', 'rev:timestamp:app']);

gulp.task('rev:qa', $.sequence('rev:reset', 'rev:timestamp'));

// Cache Buster for PROD

gulp.task('rev:timestamp:dist:login', function(){
	return gulp.src('../*.html')
		.pipe($.justReplace([
		  {
		    search: /%YCSTIMESTAMP%/g,
		    replacement: (new Date()).getTime()
		  }
		]))
		.pipe(gulp.dest('.dist/ycsadmin'));
});

gulp.task('rev:timestamp:dist:app', function(){
	return gulp.src('../app/**/*.html')
		.pipe($.justReplace([
		  {
		    search: /%YCSTIMESTAMP%/g,
		    replacement: (new Date()).getTime()
		  }
		]))
		.pipe(gulp.dest('.dist/ycsadmin/app'));
});

gulp.task('rev:timestamp:dist',  ['rev:timestamp:dist:login', 'rev:timestamp:dist:app']);

gulp.task('rev:dist', $.sequence('rev:reset', 'rev:timestamp:dist'));

// Access

gulp.task('assets:public', ['dist:app'], function(){
	return gulp.src([
			'js/**/*',
			'css/**/*',
			'fonts/**/*',
			'img/**/*'
		])
		.pipe($.copy('.dist/ycsadmin/public'))
		.pipe($.filesize());
});

gulp.task('assets:favicon', function(){
	return gulp.src('../*.ico')
		.pipe(gulp.dest('.dist/ycsadmin'))
		.pipe($.filesize());
});

gulp.task('assets', ['assets:public', 'assets:favicon']);

gulp.task('zipball', ['rev:dist', 'assets'], function(){
  var now = new Date();
  var dateStr = String(now.getFullYear()).substr(2) + '' + (now.getMonth() + 1) + (now.getDate() < 10 ? '0' : '') + now.getDate();
  var timeStr = (now.getHours()) + '' + ((now.getMinutes() < 10 ? '0' : '') + now.getMinutes());
  var filename = 'ycsadmin_' + dateStr + '_' + timeStr + '.zip';

	return gulp.src('.dist/**/*')
		.pipe($.zip(filename))
		.pipe(gulp.dest('zip'));
});

// Distribution for QA

gulp.task('qa', ['dist:app', 'css', 'rev:qa']);

// ZIP task for PROD

gulp.task('zip', $.sequence('clean', 'css', 'zipball'));