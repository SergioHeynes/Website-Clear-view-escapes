const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const simpleVars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssImport = require('postcss-import');


function taskHTML(done){
    console.log('Starting HTML task');
    done();
}

function taskStyles(done){
    console.log('Starting styles task');
    return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, autoprefixer, simpleVars, nested]))
    .pipe(gulp.dest('./app/temp/styles'));
    done();
}

function watch(done){
    console.log('Starting watch');
    gulp.watch('./app/index.html', taskHTML);
    gulp.watch('./app/assets/styles/**/*.css', taskStyles);
    done();
}



exports.taskHTML = taskHTML;
exports.taskStyles = taskStyles;
exports.watch = watch;