var del = require("del");
var gulp = require("gulp");
var args = require("yargs").argv;
var config = require("./gulp.config");
var $ = require("gulp-load-plugins")({ lazy: true });

gulp.task("lint:scripts", function () {
    return gulp
        .src(config.source.ts)
        .pipe($.tslint(config.tslint))
        .pipe($.tslint.report(config.tslint.report)); // TODO(dungdm93): apply stylish report
});

gulp.task("compile:scripts", function () {
    var project = $.typescript.createProject("tsconfig.json", config.typescript);
    return project
        .src(config.source.ts) // TODO(dungdm93): still load *.ts file not in src folder

        // .pipe($.cached("compile:scripts")) // TODO(dungdm93): recompile - symbol not found
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe($.sourcemaps.init(config.sourcemaps.init))
        .pipe(project())
        .pipe($.sourcemaps.write(".", config.sourcemaps.write))
        .pipe(gulp.dest(config.distribution.dir));
});

gulp.task("watch:scripts", ["compile:scripts"], function () {
    // TODO(dungdm93): gulp.watch not triggered for added or deleted files
    // added file: compile and inject (reload)
    // deleted file: remove compiled file and reload.
    gulp.watch(config.source.ts, ["compile:scripts"]);
});

gulp.task("clean:scripts", function () {
    del(config.distribution.scripts);
});

gulp.task("lint:styles", function () {
    return gulp
        .src(config.source.css)
        .pipe($.stylelint(config.stylelint))
});

gulp.task("compile:styles", function () {
    return gulp
        .src(config.source.css)

        .pipe($.cached("compile:styles"))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe($.sourcemaps.init(config.sourcemaps.init))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write(".", config.sourcemaps.write))
        .pipe(gulp.dest(config.distribution.dir));
});

gulp.task("watch:styles", ["compile:styles"], function () {
    gulp.watch(config.source.css, ["compile:styles"]);
});

gulp.task("clean:styles", function () {
    del(config.distribution.styles);
});

gulp.task("lint:html", function () {
    return gulp
        .src(config.source.html)
        .pipe($.htmllint());
});

gulp.task("compile:html", function () {
    return gulp
        .src(config.source.html)

        .pipe($.cached("compile:html"))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe(gulp.dest(config.distribution.dir));
});

gulp.task("watch:html", ["compile:html"], function () {
    gulp.watch(config.source.html, ["compile:html"]);
});

gulp.task("clean:html", function () {
    del(config.distribution.html);
});

gulp.task("assets:images", function () {
    return gulp
        .src(config.source.image)
        .pipe($.imagemin(config.imagemin))
        .pipe(gulp.dest(config.distribution.images));
})

gulp.task("clean:images", function () {
    del(config.distribution.images);
});

gulp.task("assets:fonts", function () {
    return gulp
        .src(config.source.font)
        .pipe(gulp.dest(config.distribution.fonts));
})

gulp.task("clean:fonts", function () {
    del(config.distribution.fonts);
});

gulp.task("clean:dist", function () {
    del(config.distribution.dir);
});

gulp.task("clean:report", function () {
    del(config.report.dir);
});

gulp.task("clean", ["clean:dist", "clean:report"]);
