/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var envify = require('envify/custom'),
    pugify = require('pugify'),
    browserifyCss = require('browserify-css');

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        packageJson = grunt.config.get('pkg'),
        browserifyFileOptions = {};

    browserifyFileOptions[config.buildJsTo] = config.browserifyFrom;

    grunt.config.set('browserify', {
        build: {
            files: browserifyFileOptions,
            options: {
                browserifyOptions: {
                    debug: config.includeJsMaps,
                    standalone: packageJson.name
                },
                transform: [envify({
                    dataAttributeBase: config.dataAttributeBase,
                    fontAwesomeCdnUrl: config.fontAwesomeCdnUrl
                }), [browserifyCss, {
                    "autoInject": false,
                    "minify": true,
                    "rootDir": "."
                }], pugify.pug({
                    pretty: false
                })]
            }
        }
    });
};
