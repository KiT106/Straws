var gulp = require("gulp");
var args = require('yargs').argv;
var config = require("./gulp.config");
var $ = require("gulp-load-plugins")({ lazy: true });

gulp.task("lint:scripts", function () {
    return gulp
        .src(config.source.ts)
        .pipe($.tslint(config.tslint))
        .pipe($.tslint.report(config.tslint.report)); // TODO(dungdm93): apply stylish report
});

gulp.task("compile:scripts", function () {
    var project = $.typescript.createProject('tsconfig.json');
    return project
        .src(config.source.ts)

        .pipe($.cached("compile:scripts"))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        .pipe($.sourcemaps.init())
        .pipe(project())
        .pipe($.sourcemaps.write(config.root))
        .pipe(gulp.dest(config.distribution.dir));
});
