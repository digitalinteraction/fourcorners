/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        jsTask = ['browserify'],
        cssTask = ['sass', 'cssmin', 'browserify', 'copy:cssToDemo'];

    if (config.uglifyJs) {
        jsTask.push('uglify');
    }

    grunt.config.set('watch', {
        sass: {
            files: [config.sassWatch],
            tasks: cssTask.concat(jsTask.concat(['copy:scripts', 'copy:jsToDemo'])),
            options: {
                debounceDelay: config.watchDebounceDelay
            }
        },
        scripts: {
            files: [config.watchJsSrc],
            tasks: jsTask.concat(['copy:scripts', 'copy:jsToDemo']),
            options: {
                debounceDelay: config.watchDebounceDelay
            }
        }
    });

};