/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var envify = require('envify/custom'),
    pugify = require('pugify'),
    sassify = require('sassify');

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        packageJson = grunt.config.get('pkg'),
        browserifyFileOptions = {};

    browserifyFileOptions[config.buildJsFolder + config.distStandaloneFileName] = config.browserifyStandaloneFrom;
    browserifyFileOptions[config.buildJsFolder + config.distNpmFileName] = config.browserifyNpmFrom;

    grunt.config.set('browserify', {
        build: {
            files: browserifyFileOptions,
            options: {
                browserifyOptions: {
                    debug: config.includeJsMaps,
                    standalone: packageJson.name
                },
                transform: [envify({
                    dataAttributeBase: config.dataAttributeBase
                }), [sassify, {
                    "auto-inject": false,
                    base64Encode: false,
                    sourceMap: config.includeCssMaps
                }], pugify.pug({
                    pretty: false
                })]
            }
        }
    });
};
