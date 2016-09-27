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

        .pipe($.cached("compile:scripts"))
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
    var del = require("del");

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
    var del = require("del");

    del(config.distribution.styles);
});

gulp.task("assets:images", function () {
    return gulp
        .src(config.source.image)
        .pipe($.imagemin(config.imagemin))
        .pipe(gulp.dest(config.distribution.images));
})

gulp.task("clean:images", function () {
    var del = require("del");

    del(config.distribution.images);
});

gulp.task("assets:fonts", function () {
    return gulp
        .src(config.source.font)
        .pipe(gulp.dest(config.distribution.fonts));
})

gulp.task("clean:fonts", function () {
    var del = require("del");

    del(config.distribution.fonts);
});
