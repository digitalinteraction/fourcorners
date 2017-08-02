'use strict';

module.exports = function (grunt) {

    var configPath = grunt.option("config"),
        tskList, config;

    if (!configPath) {
        throw "Path to config file is not provided. Define after --config"
    }

    config = grunt.file.readJSON(configPath);

    grunt.config.set('environment', config);
    grunt.config.set('pkg', grunt.file.readJSON('package.json'));

    require('./grunt-tasks/browserify')(grunt);
    require('./grunt-tasks/copy')(grunt);
    require('./grunt-tasks/uglify')(grunt);
    require('./grunt-tasks/watch')(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    tskList = ['browserify'];

    if (config.uglifyJs) {
        tskList.push('uglify');
    }

    tskList.push.apply(tskList, ['copy']);

    if (config.watch) {
        tskList.push('watch');
    }

    grunt.registerTask('default', tskList);
};