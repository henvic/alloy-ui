// verify if the TRAVIS_PULL_REQUEST environment variable exists,
// and if so only run the phantom tests
// instead of running tests on all browsers, maybe
//
//
// do a brief screencast showing how to run tests and so on
// show saucelab's own screencast functionality
//
// show that YUI is using screencast, automatic screenshots, and so on

//var capabilities = require('./capabilities.json');



function escape(string) {
    return string.replace(/([;=])/g, '\\$1');
}

function getCapability(raw) {
    var prop,
        properties = '';

    for (prop in raw) {
        if (raw.hasOwnProperty(prop)) {
            properties += escape(prop) + '=' + escape(raw[prop]) + ';';
        }
    }

    return properties;
}

function run() {
    var cmds = ['yeti'],
        item,
        options = getCapabilities();

    for (item in options) {
        if (options.hasOwnProperty(item)) {
            cmds.push('--caps');
            cmds.push('"' + options[item] + '"');
        }
    }

    console.log(cmds.join(' '));
}

run();
