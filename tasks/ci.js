var capsList = require('../capabilities.json'),
    async = require('async'),
    gulp = require('gulp'),
    path = require('path'),
    CWD = path.join(process.env.INIT_CWD, 'src'),
    spawn = require('spawn-local-bin'),
    run = require('run-sequence');

function escape(string) {
    return string.replace(/([;=])/g, '\\$1');
}

function getCapabilities(raw) {
    var prop,
        properties = '';

        //if on travis: capabilities["tunnel-identifier"] = environment variable TRAVIS_JOB_NUMBER

    for (prop in raw) {
        if (raw.hasOwnProperty(prop)) {
            properties += escape(prop) + '=' + escape(raw[prop]) + ';';
        }
    }

    return properties;
}

gulp.task('ci-browsers', function (callback) {
    async.mapSeries(capsList, function (capabilities, res) {
        var cmd = 'yeti',
            caps = getCapabilities(capabilities),
            args = ['--wd-url',
            'http://henvic:3456eb67-bd1e-4220-ae17-61462641df4c@ondemand.saucelabs.com', '--caps', caps];

        spawn(cmd, args, CWD)
            .on('exit', function(code) {
                if (code !== 0) {
                    console.error('Test on \'' + caps + '\' failed with exit code ' + code);
                }

                res(null, code);
            });
    }, function (err, result) {
        var success = result.filter(function (each) {
            return each !== 0;
        }).length === 0;

        if (!success) {
            console.error('Some tests failed.');
            process.nextTick(function () {
                process.exit(1);
            });
        }

        callback();
    });
});

gulp.task('ci', function (callback) {
    if (!process.env.CI) {
        console.log('Warning: you\'re expected to run this task inside a CI env.');
    }

    run(process.env.TRAVIS_PULL_REQUEST ? 'test' : 'ci-browsers', callback);
});
