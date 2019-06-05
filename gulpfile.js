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






exports.taskHTML = taskHTML;
exports.taskStyles = taskStyles;
exports.watch = watch;
exports.scripts = scripts;