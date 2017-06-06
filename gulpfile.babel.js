import path from 'path';
import gulp from 'gulp';
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import plumber from 'gulp-plumber';
import uglify from 'gulp-uglify';
import stylus from 'gulp-stylus';
import pug from 'gulp-pug';
import imagemin from 'gulp-imagemin';
import autoprefixer from 'gulp-autoprefixer';

const dirs = {
	src: path.join(__dirname, 'src'),
	dist: path.join(__dirname, 'dist'),
	js: path.join(__dirname, 'src', 'js'),
	jsfinal: path.join(__dirname, 'dist', 'js'),
	stylus: path.join(__dirname, 'src', 'stylus'),
	stylusfinal: path.join(__dirname, 'dist', 'css'),
	views: path.join(__dirname, 'src', 'views'),
	img: path.join(__dirname, 'src', 'img'),
	imgfinal: path.join(__dirname, 'dist', 'img'),
	fonts: path.join(__dirname, 'src', 'fonts'),
	fontsfinal: path.join(__dirname, 'dist', 'fonts'),
	maps: path.join(__dirname, 'dist', 'maps')
};

const deps = [
	'jquery',
	// 'angular'
];

gulp.task('jsVendor', () => {
	const b = browserify();

	deps.forEach(dep => {
		b.require(dep);
	});

	return b.bundle()
		.on('error', (err) => {
			console.log(err.toString())
		})
		.pipe(plumber())
		.pipe(source('vendor.min.js'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest(dirs.jsfinal));
});

gulp.task('jsApp', () => {
	return browserify([path.join(dirs.js, 'app.js')], {base: dirs.src})
		.external(deps)
		.transform(babelify)
		.bundle()
		.on('error', function (err) {
            console.error("\n\x1b[31m%s\x1b[31m\n\x1b[37m", 'Unhandled error:\n' + err.toString());
            this.emit("end");
        })
		.pipe(source('app.min.js'))
		.pipe(buffer())
		// .pipe(uglify({ mangle: false }))
		.pipe(uglify())
		.pipe(gulp.dest(dirs.jsfinal));
});

gulp.task('stylus', () => {
	return gulp.src(path.join(dirs.stylus, 'style.styl'))
		.pipe(plumber())
		.pipe(stylus({
			compress: true
		}))
		.pipe(autoprefixer({ browsers: ['last 2 versions'] }))
		.pipe(gulp.dest(dirs.stylusfinal));
});

gulp.task('imagemin', () => {
	return gulp.src(path.join(dirs.img, '**/*'))
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest(dirs.imgfinal));
});

gulp.task('fonts', () => {
	return gulp.src(path.join(dirs.fonts, '*'))
		.pipe(gulp.dest(dirs.fontsfinal));
});

gulp.task('pug', () => {
	return gulp.src([
			'!' + path.join(dirs.views, 'header.pug'),
			'!' + path.join(dirs.views, 'footer.pug'),
			'!' + path.join(dirs.views, 'layout.pug'),
			path.join(dirs.views, '*.pug')
		])
		.pipe(plumber())
		.pipe(pug())
		.pipe(gulp.dest(dirs.dist));
});

gulp.task('watch', () => {
	gulp.watch(path.join(dirs.js, '**/*.js'), ['jsApp', 'jsVendor']);
	gulp.watch(path.join(dirs.stylus, '**/*.styl'), ['stylus']);
	gulp.watch(path.join(dirs.views, '**/*.pug'), ['pug']);
	gulp.watch(path.join(dirs.img, '**/*'), ['imagemin']);
});

gulp.task('build', ['jsApp', 'jsVendor', 'stylus', 'pug', 'imagemin', 'fonts']);

gulp.task('default', ['build', 'watch']);