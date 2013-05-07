'use strict';

module.exports = function(grunt) {
  var glob = require("glob"),
    src_js_files = glob.sync('src/js/*.js'),
    src_css_files = glob.sync('src/css/*.css'),
    uglify_assoc = {},
    cssmin_assoc = {};

  src_js_files.forEach(function(file) {
    uglify_assoc[file.replace(/src\/js\/(.*)\.js$/, 'dist/js/$1.js')] = [file];
  });

  src_css_files.forEach(function(file) {
    cssmin_assoc[file.replace(/src\/css\/(.*)\.css$/, 'dist/css/$1.css')] = [file];
  });

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: cssmin_assoc
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: uglify_assoc,
      }
    },
    jshint: {
      lib: {
        options: {
          jshintrc: '.jshintsrc'
        },
        src: 'src/js/*.js'
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');


  // Default task.
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);

};
