var del = require("del");
var gulp = require("gulp");
var args = require("yargs").argv;
var config = require("./gulp.config");
var $ = require("gulp-load-plugins")({ lazy: true });

/****************** Lint ******************/
gulp.task("lint:scripts", () => {
    return gulp
        .src(config.source.ts)
        .pipe($.cached("lint:scripts"))
        .pipe($.tslint(config.tslint))
        .pipe($.tslint.report(config.tslint.report)); // TODO(dungdm93): apply stylish report
});

gulp.task("lint:styles", () => {
    return gulp
        .src(config.source.css)
        .pipe($.cached("lint:styles"))
        .pipe($.stylelint(config.stylelint))
});

gulp.task("lint:markup", () => {
    return gulp
        .src(config.source.html)
        .pipe($.cached("lint:markup"))
        .pipe($.htmllint(config.htmllint)); // TODO(dungdm93): htmllint dont't call callback when error
});

/****************** Compile & Assets ******************/
gulp.task("compile:scripts", gulp.series("lint:scripts", () => {
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
}));

gulp.task("compile:styles", gulp.series("lint:styles", () => {
    return gulp
        .src(config.source.css)

        .pipe($.cached("compile:styles"))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe($.sourcemaps.init(config.sourcemaps.init))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write(".", config.sourcemaps.write))
        .pipe(gulp.dest(config.distribution.dir));
}));

gulp.task("compile:markup", gulp.series("lint:markup", () => {
    return gulp
        .src(config.source.html)

        .pipe($.cached("compile:html"))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe(gulp.dest(config.distribution.dir));
}));

gulp.task("assets:images", () => {
    return gulp
        .src(config.source.image)
        .pipe($.imagemin(config.imagemin))
        .pipe(gulp.dest(config.distribution.images));
})

gulp.task("assets:fonts", () => {
    return gulp
        .src(config.source.font, { read: false })
        .pipe(gulp.dest(config.distribution.fonts));
})

/****************** Clean ******************/
gulp.task("clean:scripts", () => {
    return del(config.distribution.scripts);
});

gulp.task("clean:styles", () => {
    return del(config.distribution.styles);
});

gulp.task("clean:markup", () => {
    return del(config.distribution.html);
});

gulp.task("clean:images", () => {
    return del(config.distribution.images);
});

gulp.task("clean:fonts", () => {
    return del(config.distribution.fonts);
});

gulp.task("clean:dist", () => {
    return del(config.distribution.dir);
});

gulp.task("clean:report", () => {
    return del(config.report.dir);
});

gulp.task("clean", gulp.parallel("clean:dist", "clean:report"));

/****************** Build ******************/
gulp.task("inject", gulp.series(
    gulp.parallel("compile:scripts", "compile:styles", "compile:markup"),
    () => {
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.source.index)
            .pipe(wiredep(config.wiredep))
            .pipe($.inject(gulp.src(config.distribution.js)))
            .pipe($.inject(gulp.src(config.distribution.css)))
            .pipe(gulp.dest(config.distribution.dir));
    })
);
