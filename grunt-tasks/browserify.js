/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var envify = require('envify/custom'),
    jadeify = require('jadeify'),
    browserifyCss = require('browserify-css');

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        browserifyFileOptions = {};

    browserifyFileOptions[config.buildJsTo] = config.browserifyFrom;

    grunt.config.set('browserify', {
        build: {
            files: browserifyFileOptions,
            options: {
                browserifyOptions: {
                    debug: config.includeJsMaps
                },
                transform: [envify({
                    dataAttributeBase: config.dataAttributeBase,
                    insertCssWithJs: config.insertCssWithJs,
                    fontAwesomeCdnUrl: config.fontAwesomeCdnUrl
                }), [browserifyCss, {
                    "autoInject": true,
                    "minify": true,
                    "rootDir": "."
                }], jadeify]
            }
        }
    });
};
