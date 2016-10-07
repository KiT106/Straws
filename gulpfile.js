var del = require("del");
var gulp = require("gulp");
var args = require("yargs").argv;
var config = require("./gulp.config");
var browserSync = require('browser-sync').create();
var $ = require("gulp-load-plugins")({ lazy: true });

var htmlInjector = require("bs-html-injector");

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
        .pipe(gulp.dest(config.distribution.dir))

        .pipe($.cached("sync:scripts"))
        .pipe(browserSync.stream({ match: '**/*.js' }));
}));

gulp.task("compile:styles", gulp.series(() => {
    return gulp
        .src(config.source.css)

        // .pipe($.cached("compile:styles")) // enable: don't compile when partial change.
        // disable above to perform full compile :(
        // furthermore, partial compile can't use with concat
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())

        // .pipe($.sourcemaps.init(config.sourcemaps.init))
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe($.concat('all.css'))
        .pipe($.cleanCss())
        // .pipe($.sourcemaps.write(".", config.sourcemaps.write))
        .pipe(gulp.dest(config.distribution.dir))

        .pipe($.cached("sync:styles")) // only sync changed files
        .pipe(browserSync.stream({ match: '**/*.css' }));
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
    inject)
);

gulp.task("build", gulp.series(
    "clean",
    gulp.parallel("inject", "assets:images", "assets:fonts"))
);

gulp.task("browser-sync", (done) => {
    browserSync.use(htmlInjector, {
        files: config.distribution.html
    });
    browserSync.init(config.browserSync);
    done();
});

gulp.task("serve", gulp.series(
    "build",
    "browser-sync",
    watch)
);

/****************** Utils ******************/
gulp.task("bump", function () {
    var options = {};
    var prompt = $.prompt.prompt({
        type: "list",
        name: "bump",
        message: "What type of bump would you like to do?",
        choices: ["patch", "minor", "major"]
    }, function (res) {
        options.type = res.bump;
    });

    return gulp
        .src(config.packages)
        .pipe(prompt)
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));
});

function inject() {
    var wiredep = require("wiredep").stream;
    var injectSrc = gulp.src([config.distribution.js, config.distribution.css]);

    return gulp
        .src(config.distribution.index)
        .pipe(wiredep(config.wiredep))
        .pipe($.inject(injectSrc, config.inject))
        .pipe(gulp.dest(config.distribution.dir));
};
inject.description = "Wiring up the js, css and bower dependencies into the html";

function watch() {
    var log = console.log.bind(console);

    var scriptsSoftChange = gulp.series("compile:scripts");
    var scriptsHardChange = gulp.series("clean:scripts", "compile:scripts", inject);

    var stylesSoftChange = gulp.series("compile:styles");
    var stylesHardChange = gulp.series("clean:styles", "compile:styles", inject);

    gulp.watch(config.source.ts)
        .on("add", scriptsHardChange)
        .on("change", scriptsSoftChange)
        .on("unlink", scriptsHardChange);

    gulp.watch(config.source.css, stylesSoftChange);
        // comment bellow lines when concat scripts
        // .on("add", stylesHardChange)
        // .on("change", stylesSoftChange)
        // .on("unlink", stylesHardChange);

    gulp.watch([config.source.html, not(config.source.index)])
        .on("all", gulp.series("compile:markup"));              // htmlInjector auto refresh

    gulp.watch(config.source.index)
        .on("change", gulp.series("compile:markup", inject));   // htmlInjector auto refresh
}
watch.description = "watches the files, builds, and restarts browser-sync";

function refresh() {
    var log = console.log.bind(console);

    log("browserSync reloading...");
    browserSync.reload();
}
refresh.description = "reload browserSync";

// Negative the pattern
function not(globs) {
    if (Array.isArray(globs)) {
        return globs.map(not);
    }
    if (globs.startsWith("!")) return globs.substring(1);
    if (globs.startsWith("./")) return "!" + globs.substring(2);
    return "!" + globs;
}
