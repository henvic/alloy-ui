We can use
`travis logs` to see what caused a build to fail.

https://coveralls.io/
http://docs.travis-ci.com/user/sauce-connect/
https://github.com/alexeyraspopov/gulp-complexity
http://saucelabs.com/javascript/yui-tests
http://sauceio.com/index.php/2013/06/guest-post-testing-javascript-with-yeti-and-sauce-labs-webdriver-with-ryuichi-okumura/
https://docs.saucelabs.com/reference/sauce-connect/
https://docs.saucelabs.com/tutorials/js-unit-testing/
https://docs.saucelabs.com/ci-integrations/travis-ci/
https://github.com/yui/yeti/blob/master/.travis.yml











Instrumentation:
istanbul instrument src -x "[ **/node_modules/**, **/test/**, **/tests/**, **/meta/** ]" -o coverage

