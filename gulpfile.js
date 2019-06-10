const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const simpleVars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssImport = require('postcss-import');
const browserSync = require('browser-sync').create();
const mixins = require('postcss-mixins');
const hexrgba = require('postcss-hexrgba');
const webpack = require('webpack');
const imagemin = require('gulp-imagemin');
const del = require('del');
const usemin = require('gulp-usemin');
const rev = require('gulp-rev');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');


function previewDist() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: 'docs'
        }
    });
}

function deleteDistFolder(){
    return del('./docs');
}

function taskHTML(done){
    console.log('Starting HTML task');
    browserSync.reload();
    done();
}

function taskStyles(done){
    console.log('Starting styles task');
    return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, mixins, simpleVars, nested, hexrgba, autoprefixer]))
    .on('error', function(errorInfo){
        console.log(errorInfo.toString());
        this.emit('end');
    })
    .pipe(gulp.dest('./app/temp/styles'));
    done();
}

function cssInject(done){
    console.log('CSS file modified');
    gulp.src('./app/temp/styles/styles.css')
    .pipe(browserSync.stream());
    done();
}

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

function refreshScripts(done){
    browserSync.reload();
    done();
}

function watch(done){
    console.log('Starting watch');

    browserSync.init({
        notify: false,
        server: {
            baseDir: 'app'
        }
    });

    gulp.watch('./app/index.html', taskHTML);
    gulp.watch('./app/assets/styles/**/*.css', gulp.series(taskStyles, cssInject));
    gulp.watch('./app/assets/scripts/**/*.js', gulp.series(scripts, refreshScripts));
    done();
}

function optimizeImages() {
    return gulp.src(['./app/assets/images/**/*'])
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        multipass: true
    }))
    .pipe(gulp.dest('./docs/assets/images'));
}

function useminTask() {
    return gulp.src('./app/index.html')
    .pipe(usemin({
        css: [function() {return rev()}, function() {return cssnano()}],
        js: [function() {return rev()}, function() {return uglify()}]
    }))
    .pipe(gulp.dest('./docs'));
}

const build = gulp.series(deleteDistFolder, gulp.parallel(gulp.series(gulp.parallel(taskStyles, scripts), useminTask), optimizeImages));

exports.taskHTML = taskHTML;
exports.taskStyles = taskStyles;
exports.watch = watch;
exports.scripts = scripts;
exports.build = build;
exports.previewDist = previewDist;