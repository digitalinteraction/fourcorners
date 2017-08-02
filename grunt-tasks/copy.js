/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (grunt) {

    var config = grunt.config.get('environment');

    grunt.config.set('copy', {
        standaloneScript: {
            expand: true,
            flatten: true,
            src: config.buildJsFolder + config.distStandaloneFileName,
            dest: config.distributionFolder
        },
        npmScript: {
            expand: true,
            flatten: true,
            src: config.buildJsFolder + config.distNpmFileName,
            dest: config.distributionFolder
        },
        standaloneToDemo: {
            expand: true,
            flatten: true,
            src: config.distributionFolder + config.distStandaloneFileName,
            dest: config.demoFolder
        },
        npmToDemo: {
            expand: true,
            flatten: true,
            src: config.distributionFolder + config.distNpmFileName,
            dest: config.demoFolder
        }
    });
};