'use strict'

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  testConfig = require('./config/env/test'),
  fs = require('fs'),
  path = require('path');

module.exports = function (grunt) {
    // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS),
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: defaultAssets.client.views,
        options: {
          livereload: true
        }
      },
      clientJS: {
        files: defaultAssets.client.js,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: defaultAssets.client.css,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          watch: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true
      }
    },
    eslint: {
      options: { fix: true },
      target: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e)
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: defaultAssets.client.css
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': defaultAssets.client.js
        }
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': [ defaultAssets.client.lib.js, 'public/dist/application.js' ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': _.union(defaultAssets.client.lib.css, defaultAssets.client.css)
        }
      }
    },
    protractor: {
      options: {
        configFile: 'protractor.conf.js',
        noColor: false,
        webdriverManagerUpdate: true
      },
      e2e: {
        options: {
          args: {} // Target-specific arguments
        }
      }
    },
    copy: {
      localConfig: {
        src: 'config/env/local.example.js',
        dest: 'config/env/local-development.js',
        filter: function () {
          return !fs.existsSync('config/env/local-development.js');
        }
      }
    }
  });

    // Load NPM tasks
  require('load-grunt-tasks')(grunt);

    // Make sure upload directory exists
  grunt.task.registerTask('mkdir:upload', 'Task that makes sure upload directory exists.', function () {
        // Get the callback
    var done = this.async();
    grunt.file.mkdir(path.normalize(__dirname + '/modules/users/client/img/profile/uploads'));
    done();
  });

    // Connect to the MongoDB instance and load the models
  grunt.task.registerTask('mongoose', 'Task that connects to the MongoDB instance and loads the application models.', function () {
        // Get the callback
    var done = this.async();

        // Use mongoose configuration
    var mongoose = require('./config/lib/mongoose.js');

        // Connect to database
    mongoose.connect(function (db) {
      done();
    });
  });

    // Drops the MongoDB database, used in e2e testing
  grunt.task.registerTask('dropdb', 'drop the database', function () {
        // async mode
    var done = this.async();

        // Use mongoose configuration
    var mongoose = require('./config/lib/mongoose.js');

    mongoose.connect(function (db) {
      db.connection.db.dropDatabase(function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully dropped db: ', db.connection.db.databaseName);
        }

        db.connection.db.close(done);
      });
    });
  });

  grunt.task.registerTask('server', 'Starting the server', function () {
        // Get the callback
    var done = this.async();
    var path = require('path');
    var app = require(path.resolve('./config/lib/app'));

    var server = app.start(function () {
      done();
    });
  });

    // Lint CSS and JavaScript files.
  grunt.registerTask('lint', ['eslint', 'csslint']);

    // Lint project files and minify them into two production files.
  grunt.registerTask('build', ['env:dev', 'lint', 'ngAnnotate', 'uglify', 'cssmin']);

    // Run the project in development mode
  grunt.registerTask('default', ['env:dev', 'lint', 'mkdir:upload', 'copy:localConfig', 'concurrent:default']);

    // Run the project in debug mode
  grunt.registerTask('debug', ['env:dev', 'lint', 'mkdir:upload', 'copy:localConfig', 'concurrent:debug']);

    // Run the project in production mode
  grunt.registerTask('prod', ['build', 'env:prod', 'mkdir:upload', 'copy:localConfig', 'concurrent:default']);
};
