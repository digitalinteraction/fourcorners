/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment'),
        minifyCssTo = config.sassTo.replace(/.css$/, '.min.css');

    grunt.config.set('copy', {
        scripts: {
            expand: true,
            flatten: true,
            src: config.buildJsTo,
            dest: config.distributionFolder
        },
        jsToDemo: {
            expand: true,
            flatten: true,
            src: config.distributionFolder + '*',
            dest: config.demoFolder
        },
        cssToDemo: {
            expand: true,
            flatten: true,
            src: [config.sassTo, config.sassTo + '.map', minifyCssTo, minifyCssTo + '.map'],
            dest: config.demoFolder
        }
    });
};