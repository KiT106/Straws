var gulp = require("gulp");
var config = require("./gulp.config");
var $ = require("gulp-load-plugins")({ lazy: true });

gulp.task("lint:scripts", function () {
    return gulp
        .src(config.source.ts)
        .pipe($.tslint(config.tslint))
        .pipe($.tslint.report(config.tslint.report));
})
