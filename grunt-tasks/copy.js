/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment');

    grunt.config.set('copy', {
        scripts: {
            expand: true,
            flatten: true,
            src: config.uglifyJs ? config.buildJsTo : config.browserifyTo,
            dest: config.distributionFolder
        },
        jsToDemo: {
            expand: true,
            flatten: true,
            src: config.uglifyJs ? config.buildJsTo : config.browserifyTo,
            dest: config.demoFolder
        },
        cssToDemo: {
            expand: true,
            flatten: true,
            src: [config.sassTo, config.sassTo.replace(/.css$/, '.min.css'), config.minifyCssTo + '.map'],
            dest: config.demoFolder
        }
    });
};