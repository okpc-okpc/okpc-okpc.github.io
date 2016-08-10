var gulp = require('gulp'),
	gutil = require('gulp-util'),
	through2 = require('through2'),
	gulpIf = require('gulp-if'),
	htmlv = require('gulp-w3cjs'),
	csslint = require('gulp-csslint'),
	csscomb = require('gulp-csscomb'),
	// concat = require('gulp-concat'),
	// cssmin = require('gulp-cssmin'),
	// uglify = require('gulp-uglify'),
	plumber = require('gulp-plumber'),
	autoprefixer = require('gulp-autoprefixer'),
	eslint = require('gulp-eslint'),
	webserver = require('gulp-webserver');

function isFixed(file) {
	// Has ESLint fixed the file contents?
	return file.eslint != null && file.eslint.fixed;
}

gulp.task('htmlValid', function () {
	gulp.src('./index.html')
		.pipe(htmlv())
		.pipe(through2.obj(function(file, enc, cb){
			cb(null, file);
			if (!file.w3cjs.success){
				gutil.log('\n==========================================' +
					'\n======= htmlValid is ended ===============' +
					'\n==========================================');
			}
		}));
});

gulp.task('cssLint', function() {
	gulp.src('./src/styles/*.css')
		.pipe(plumber())
		.pipe(csslint())
		.pipe(csslint.reporter())
		.on('end', function () {
			gutil.log('\n==========================================' +
				'\n======== cssLint is ended ================' +
				'\n==========================================');
		});
});

gulp.task('css', function () {
	gulp.src('./src/styles/*.css')
	.pipe(plumber())
	.pipe(autoprefixer({
		browsers: ['last 3 versions']
	}))
	.pipe(csscomb())
	.pipe(gulp.dest('./src/styles/'));
});

gulp.task('cssCopy', function () {
	gulp.src('./src/styles/*.css')
	.pipe(gulp.dest('./assets/css/'));
});

gulp.task('esLint', function () {
	return gulp.src(['./src/scripts/app.js','!node_modules/**'])
		.pipe(eslint({
			fix: true,
			globals:{
				"$": false,
				"Mustache": false
			}
		}))
		.pipe(eslint.format())
		.pipe(gulpIf(isFixed, gulp.dest('./src/scripts/')));
		// .pipe(eslint.failAfterError());
});

gulp.task('jsCopy', function () {
	gulp.src('./src/scripts/*.js')
	.pipe(gulp.dest('./assets/js/'));
});

gulp.task('webserver', function() {
	gulp.src('./')
		.pipe(webserver({
			livereload: true,
			directoryListing: true,
			open: true
		}));
});

gulp.task('watch', function() {
	gulp.watch('./index.html', ['htmlValid']);
	gulp.watch('./src/scripts/*.js', ['esLint', 'jsCopy']);
	gulp.watch('./src/styles/*.css', ['css', 'cssLint', 'cssCopy']);
});

gulp.task('default', ['esLint', 'jsCopy', 'css', 'cssLint', 'cssCopy', 'watch', 'webserver'])

//gulp.task('disabled', function () {

	// gulp.task('cssPrefix', function () {
	// 	return gulp.src('src/styles/*.css')
	// 		.pipe(plumber())
	// 		.pipe(autoprefixer({
	// 			browsers: ['last 3 versions']
	// 		}))
	// 		.pipe(gulp.dest('src/styles/'))
	// });

	// gulp.task('cssComb', function () {
	// 	return gulp.src('src/styles/*.css')
	// 		.pipe(csscomb())
	// 		.pipe(gulp.dest('src/styles/'))
	// });


	// gulp.task('cssConcat', function() {
	// 	gulp.src('./src/styles/*.css')
	// 		.pipe(autoprefixer())
	// 		.pipe(concat('styles.css'))
	// 		.pipe(gulp.dest('./assets/css'))
	// });

	// gulp.task('cssMin', function() {
	// 	gulp.src('./src/styles/*.css')
	// 		.pipe(plumber())
	// 		.pipe(cssmin())
	// 		.pipe(concat('styles.min.css'))
	// 		.pipe(gulp.dest('./assets/css'))
	// });

	// gulp.task('jsUglify', function() {
	// 	gulp.src('./src/scripts/*.js')
	// 		.pipe(uglify())
	// 		.pipe(gulp.dest('./assets/js'))
	// });

	// gulp.task('jsConcat', function() {
	// 	gulp.src('./src/scripts/*.js')
	// 		.pipe(uglify())
	// 		.pipe(concat('app.js'))
	// 		.pipe(gulp.dest('./assets/js'))
	// });
//});
