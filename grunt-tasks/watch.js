/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        tasks = ['browserify', 'copy'];

    if (config.uglifyJs) {
        tasks.push('uglify');
    }

    grunt.config.set('watch', {
        sass: {
            files: [config.watchScssSrc],
            tasks: tasks,
            options: {
                debounceDelay: config.watchDebounceDelay
            }
        },
        scripts: {
            files: [config.watchJsSrc],
            tasks: tasks,
            options: {
                debounceDelay: config.watchDebounceDelay
            }
        }
    });

};