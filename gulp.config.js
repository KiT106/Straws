var root = "./"
var source = "./src";
var distribution = "./dist";
var report = "./report";

var config = {
    root: root,
    source: {
        dir: source,
        ts: `${source}/**/*.ts`,
        css: `${source}/**/*.css`,
        html: `${source}/**/*.html`,
        index: `${source}/index.html`,
        font: `${source}/assets/fonts/**`,
        image: `${source}/assets/images/**`
    },
    distribution: {
        dir: distribution,
        js: `${distribution}/**/*.js`,
        css: `${distribution}/**/*.css`,
        html: `${distribution}/**/*.html`,
        index: `${distribution}/index.html`,

        scripts: [
            `${distribution}/**/*.js`,
            `${distribution}/**/*.d.ts`,
            `${distribution}/**/*.js.map`
        ],
        styles: [
            `${distribution}/**/*.css`,
            `${distribution}/**/*.css.map`
        ],
        fonts: `${distribution}/assets/fonts`,
        images: `${distribution}/assets/images`
    },
    report: {
        dir: report
    },

    // TSLint options https://github.com/panuhorsmalahti/gulp-tslint#all-default-tslint-options
    tslint: {
        // The default formatter is "prose". The available formatters include:
        // * "json" prints stringified JSON to console.log.
        // * "prose" prints short human-readable failures to console.log.
        // * "verbose" prints longer human-readable failures to console.log.
        // * "msbuild" for Visual Studio
        // * "vso" outputs failures in a format that can be integrated with Visual Studio Online.
        // * "checkstyle" for the Checkstyle development tool
        // * "pmd" for the PMD source code analyzer
        formatter: "verbose",

        // TSLint report options: https://github.com/panuhorsmalahti/gulp-tslint#all-default-report-options
        report: {
            summarizeFailureOutput: true
        }
    },

    // override compilerOptions in tsconfig.json
    // List supported & *unsupported* options: https://github.com/ivogabe/gulp-typescript#options
    typescript: {},

    // grulp-sourcemaps options
    sourcemaps: {
        // Options in sourcemaps.init() statement. See https://github.com/floridoo/gulp-sourcemaps#init-options
        init: undefined,

        // Options in sourcemaps.init() statement. https://github.com/floridoo/gulp-sourcemaps#write-options
        write: {
            includeContent: false
        }
    },

    // Stylelint options: https://github.com/olegskl/gulp-stylelint#options
    stylelint: {
        failAfterError: false,
        reporters: [
            { formatter: 'string', console: true }
        ]
    },

    autoprefixer: { browsers: ['last 2 version', '> 5%'] },

    imagemin: {
        optimizationLevel: 4
    }
}
module.exports = config;
