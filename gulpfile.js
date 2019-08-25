"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var jsmin = require("gulp-jsmin");
var autoprefixer = require("gulp-autoprefixer");
var cleanCSS = require("gulp-clean-css");
var imagemin = require("gulp-imagemin");
var imageminSvgo = require('imagemin-svgo');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminPngquant = require("imagemin-pngquant");
var cwebp = require('gulp-cwebp');
var rimraf = require("rimraf");
var gulpStylelint = require('gulp-stylelint');
var server = require("browser-sync").create();
var devip = require('dev-ip');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var htmlmin = require('gulp-htmlmin');
var run = require('run-sequence');
var pug = require('gulp-pug');
var rename = require("gulp-rename");

devip();

gulp.task('lint', function lintCssTask() { // задача - вызывается как скрипт из package.json
  return gulp
  .src("src/blocks/*.{scss,sass}") // источник
  .pipe(gulpStylelint({
    reporters: [
    {formatter: 'string', console: true}
    ]
  }));
});

gulp.task('clean', function (cb) { // задача - вызывается как скрипт из package.json
  rimraf("docs", cb); // удаление папки build (предыдущая сборка)
});

gulp.task("copy", function () { // задача - вызывается как скрипт из package.json
  gulp.src([  // источник
    "src/fonts/**/*.{woff,woff2}"
    ],
    {
      base: "src"
    })
  .pipe(gulp.dest("docs/")); // класть результат сюда
});

gulp.task("sprite", function () { // задача - вызывается как скрипт из package.json
  gulp.src("src/img/sprite/inline-*.svg") // источник
  .pipe(imagemin([
    imageminSvgo({ // сжатие svg
      plugins: [
      {removeDimensions: true},
      {removeAttrs: false},
      {removeElementsByAttr: false},
      {removeStyleElement: false},
      {removeViewBox: false}
      ]
    })
    ]))
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename({
    basename: "sprite",
    suffix: ".min"
  }))
  .pipe(gulp.dest("docs/img/")) // класть результат сюда
});

gulp.task("style", function () { // задача - вызывается как скрипт из package.json
  gulp.src("src/blocks/*.{scss,sass}") // источник
  .pipe(plumber()) // отслеживание ошибок - вывод в консоль, не дает прервать процесс
  .pipe(sass().on('error', sass.logError)) // компиляция из препроцессорного кода sass --> css кода
  .pipe(autoprefixer()) // расставление автопрефиксов
  .pipe(gulp.dest("docs/css/")) // класть результат сюда
  .pipe(cleanCSS()) // минификация
  .pipe(rename({
    suffix: ".min"
  }))
  .pipe(gulp.dest("docs/css/")) // класть результат сюда
});

gulp.task('js', function () { //задача - вызывается как скрипт из package.json
  gulp.src("src/js/script.js") // источник
  .pipe(posthtml([ // сборка из разных файлов
    include()
    ]))
  .pipe(gulp.dest("docs/js/")) // класть результат сюда
  .pipe(jsmin()) // минификация
  .pipe(rename({
    suffix: ".min"
  }))
  .pipe(gulp.dest("docs/js/")) // класть результат сюда
});

gulp.task("image", function () { // задача - вызывается как скрипт из package.json
  gulp.src("src/img/*.{png,jpg,svg}") // источник
  .pipe(imagemin([
    imageminPngquant({ // сжатие png
      quality: '80'
    }),
    imageminJpegRecompress({ // сжатие jpeg
      progressive: true,
      method: 'ms-ssim'
    }),
    imageminSvgo({ // сжатие svg
      plugins: [
      {removeDimensions: true},
      {removeAttrs: false},
      {removeElementsByAttr: false},
      {removeStyleElement: false},
      {removeViewBox: false}
      ]
    })
    ]))
  .pipe(gulp.dest("docs/img/")) // класть результат сюда
});

gulp.task("cwebp", function () { // задача - вызывается как скрипт из package.json
  gulp.src("src/img/*.*") // источник
  .pipe(cwebp())
  .pipe(gulp.dest("docs/img/")); // класть результат сюда
});

gulp.task("html", function () { // задача - вызывается как скрипт из package.json
  gulp.src("src/blocks/*.html") // источник
  .pipe(posthtml([ // сборка из разных файлов
    include()
    ]))
  .pipe(htmlmin({ collapseWhitespace: true })) // минификация
  .pipe(gulp.dest("docs/")) // класть результат сюда
});

gulp.task("pug", function buildHTML() {
  return gulp.src("src/blocks/**/*.pug")
  .pipe(pug({pretty: true})) // Запретите минифицировать HTML
  // .pipe(htmlmin({ collapseWhitespace: true })) // минификация
  .pipe(gulp.dest(function(file){
    return file.base;
  }))
});

gulp.task("watch", function() { // задача - вызывается как скрипт из package.json
  setTimeout(function(){gulp.watch("src/blocks/**/*.{scss,sass}", ["style", "reload"])},1000); // отслеживание изменений файлов scss
  setTimeout(function(){gulp.watch("src/js/**/*.js", ["js" , "reload"])},1000); // отслеживание изменений файлов js
  setTimeout(function(){gulp.watch("src/blocks/**/*.html", ["html", "reload"])},1000); // отслеживание изменений файлов html
  setTimeout(function(){gulp.watch("src/img/*.*", ["image", "reload"])},1000); // отслеживание изменений файлов img
  setTimeout(function(){gulp.watch("src/img/sprite/inline-*.svg", ["sprite", "html", "reload"])},1000); // отслеживание изменений файлов sprite svg
  setTimeout(function(){gulp.watch("src/blocks/**/*.pug", ["pug", "html", "reload"])},1000); // отслеживание изменений файлов html
});

gulp.task("reload", function() { // задача - вызывается как скрипт из package.json
  server.reload(); //обновление браузера - скрол уедет наверх
});

gulp.task ("serve", function(done) { //задача - вызывается как скрипт из package.json
  server.init({ // перед запуском start запускается рад задач, затем запускается локальный сервер
    server: "docs", // адрес к папке где лежит сборка
    notify: false,
    open: true,
    cors: true,
    host: "192.168.0.91", // дефолтный ip занят virtualbox, задача devip определила запасной ip
    ui: false
  });
  done();
});

gulp.task ("build", function(done) {
  run (
    "clean",
    "copy",
    "image",
    "cwebp",
    "sprite",
    "style",
    "js",
    "pug",
    done
    )
});

gulp.task ("start", function(done) {
  run (
    "html",
    "serve",
    "watch",
    done
    )
});

// devip --> "192.168.1.76", "192.168.1.80" or false if nothing found (ie, offline user)
