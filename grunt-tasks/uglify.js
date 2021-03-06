/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        uglifyJsFileOptions = {},
        standaloneFilePath = config.buildJsFolder + config.distStandaloneFileName,
        npmFilePath = config.buildJsFolder + config.distNpmFileName;

    uglifyJsFileOptions[standaloneFilePath] = standaloneFilePath;
    uglifyJsFileOptions[npmFilePath] = npmFilePath;

    grunt.config.set('uglify', {
        options: {
            // the banner is inserted at the top of the output
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        prod: {
            files: uglifyJsFileOptions
        }
    });
};