module.exports = function(grunt) {

  var config = {};

  // Package.json
  config.pkg = grunt.file.readJSON('package.json');

  // Copy
  config.copy = {
    source: {
      files: [
        {
          expand: true,
          cwd: 'src/',
          src: ['**'],
          dest: 'dist/'
        }
      ]
    }
  };

  // Uglify JS
  config.uglify = {
    options: {
      preserveComments: false,
      mangle: true,
      compress: true,
      report: 'min',
      banner: '/*\n * <%= pkg.description %> \n *\n' +
              ' * Version: <%= pkg.version %> \n' +
              ' * Date: <%= grunt.template.today("mmmm dS, yyyy") %> \n' +
              '<%= pkg.homepage ? " * Homepage: " + pkg.homepage + "\\n" : "" %>' +
              ' * Licence: <%= _.pluck(pkg.licenses, "type").join(", ") %> \n' +
              ' * Copyright: (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; \n' +
              ' */\n'
    },
    all: {
      files: {'dist/jquery.imageReveal.min.js': ['src/jquery.imageReveal.js'] }
    }
  };

  // CSSMin
  config.cssmin = {
    compress: {
      files: {
        'dist/jquery.imageReveal.min.css': ['src/jquery.imageReveal.css']
      }
    }
  };

  // JS Hint
  config.jshint = {
    src: ['src/**/*.js'],
    options: {
      immed: true,
      newcap: true,
      undef: true,
      eqeqeq: true,
      bitwise: true,
      laxcomma: true,
      latedef: true,
      quotmark: 'single',
      unused: true,
      strict: false,
      trailing: true,
      browser: true,
      jquery: true,
      esnext: false,
      node: false
    },
    grunt: {
      src: ['Gruntfile.js'],
      options: {
        immed: true,
        newcap: true,
        undef: true,
        eqeqeq: true,
        bitwise: true,
        laxcomma: true,
        latedef: true,
        quotmark: 'single',
        unused: true,
        strict: false,
        trailing: true,
        browser: false,
        jquery: false,
        esnext: false,
        node: true
      }
    }
  };

  // File Watcher
  config.watch = {
    js: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      tasks: ['jshint', 'uglify']
    },
    css: {
      files: ['src/**/*.css'],
      tasks: ['cssmin']
    },
    html: {
      files: ['demo/**/*.html'],
      tasks: []
    },
    options: {
      livereload: true
    }
  };

  // Express Server
  config.express = {
    server: {
      options: {
        bases: 'dist',
        port: 3000,
        host: '0.0.0.0'
      }
    }
  };

  // Zip Release
  config.compress = {
    dist: {
      options: {
        mode: 'zip',
        level: 1,
        archive: 'releases/<%= pkg.name %>-<%= pkg.version %>.zip',
        pretty: true
      },
      src: [
        'dist/*.css',
        'dist/*.js',
        'dist/demo/**/*.*',
        'README.md',
        'LICENCE-MIT',
        'package.json',
        'imageReveal.jquery.json'
      ]
    }
  };


  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.event.on('watch', function(action, filepath) {
    grunt.log.writeln(filepath + ' has ' + action);
  });

  grunt.registerTask('build', ['jshint', 'uglify', 'cssmin', 'copy']);
  grunt.registerTask('release', ['build', 'compress']);
  grunt.registerTask('default', ['build', 'express', 'watch']);
};
