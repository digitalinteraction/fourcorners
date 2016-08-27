/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {
    var config = grunt.config.get('environment'),
        fileOptions = {};

    fileOptions[config.sassTo] = config.sassFrom;

    grunt.config.set('sass', {
        options: {
            sourceMap: config.includeCssMaps
        },
        dist: {
            files: fileOptions
        }
    });
};