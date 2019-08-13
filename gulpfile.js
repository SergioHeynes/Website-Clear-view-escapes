const gulp = require('gulp'),
postcss = require('gulp-postcss'), 
autoprefixer = require('autoprefixer'), 
simpleVars = require('postcss-simple-vars'), 
nested = require('postcss-nested'), 
cssImport = require('postcss-import'), 
browserSync = require('browser-sync').create(), 
mixins = require('postcss-mixins'), 
hexrgba = require('postcss-hexrgba'), 
webpack = require('webpack'), 
imagemin = require('gulp-imagemin'), 
del = require('del'), 
usemin = require('gulp-usemin'), 
rev = require('gulp-rev'), 
cssnano = require('gulp-cssnano'), 
uglify = require('gulp-uglify');

/*----------------------------------------------------
Html
----------------------------------------------------*/
function taskHTML(done){
    console.log('Starting HTML task');
    browserSync.reload();
    done();
}

/*----------------------------------------------------
Styles
----------------------------------------------------*/
function taskStyles(done){
    console.log('Starting styles task');
    return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, mixins, simpleVars, nested, hexrgba, autoprefixer]))
    .on('error', function(errorInfo){
        console.log(errorInfo.toString());
        this.emit('end');
    })
    .pipe(browserSync.stream())
    .pipe(gulp.dest('./app/temp/styles'));
    done();
}

/*----------------------------------------------------
Scripts
----------------------------------------------------*/
function scripts(done){
    console.log('Starting scripts task');
    webpack(require('./webpack.config.js'), function(err, stats){
        if(err){
            console.log(err.toString());
        }
        console.log('Webpack done!');
        console.log(stats.toString());
    });
    done();
}

/*----------------------------------------------------
Watch
----------------------------------------------------*/
function watch(done){
    console.log('Starting watch');

    browserSync.init({
        notify: false,
        server: {
            baseDir: 'app'
        }
    });

    gulp.watch('./app/assets/scripts/**/*.js').on('change', browserSync.reload);
    gulp.watch('./app/assets/styles/**/*.css', taskStyles);
    gulp.watch('./app/*.html').on('change', browserSync.reload);
}
    

/*----------------------------------------------------
Images
----------------------------------------------------*/
function optimizeImages() {
    return gulp.src(['./app/assets/images/**/*'])
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        multipass: true
    }))
    .pipe(gulp.dest('./docs/assets/images'));
}


/*----------------------------------------------------
Preparing files for go live
----------------------------------------------------*/
function useminTask() {
    return gulp.src('./app/index.html')
    .pipe(usemin({
        css: [function() {return rev()}, function() {return cssnano()}],
        js: [function() {return rev()}, function() {return uglify()}]
    }))
    .pipe(gulp.dest('./docs'));
}

/*----------------------------------------------------
Preview of the project from dist/docs folder
----------------------------------------------------*/
function previewDist() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: 'docs'
        }
    });
}

/*----------------------------------------------------
Delete dist folder
----------------------------------------------------*/
function deleteDistFolder(){
    return del('./docs');
}

/*----------------------------------------------------
Build
----------------------------------------------------*/
const build = gulp.series(deleteDistFolder, taskStyles, scripts, useminTask, optimizeImages);

/*----------------------------------------------------
Exports
----------------------------------------------------*/
exports.watch = watch;
exports.build = build;
exports.previewDist = previewDist;