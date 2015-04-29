module.exports = function(grunt) {
    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    //Load in the build configuration file.
    var userConfig = require('./build.config.js');

    //Give the Grunt plugins their instructions!
    var taskConfig = {

        //https://github.com/gruntjs/grunt-contrib-connect
        // connect: {
        //     server: {
        //         options: {
        //             port: 3000,
        //             base: '<%= docs_dir %>',
        //             // Change this to '0.0.0.0' to access the server from outside.
        //             hostname: 'localhost',
        //             livereload: true,
        //             open: true
        //         }
        //     }
        // },

        //combine files like this: 'dist/js/output.js': ['js/input.js', 'js/input2.js']
        uglify: {
            scriptz: {
                files: {
                    '<%= dist_dir %>/easyVideoEmbed.min.js': '<%= src_dir %>/js/easyVideoEmbed.js'
                }
            }
        },

        //copy files from development dir to the build dir
        copy: {
            main: {
                files: [{
                    src: ['<%= src_dir %>/js/easyVideoEmbed.js'],
                    dest: '<%= dist_dir %>/'
                }, {
                    expand: true,
                    flatten: true,
                    src: ['<%= src_dir %>/js/easyVideoEmbed.js'],
                    dest: '<%= docs_dir %>/js/',
                    filter: 'isFile'
                }]
            },
        },

        //lint JS files & display output in terminal
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= src_dir %>/js/*.js'
                ]
            }
        },

        //Empties the build folder to start fresh. Use the command: grunt clean
        clean: [
            '<%= dist_dir %>',
            '<%= docs_dir %>/_site'
        ],


        //, '<%= docs_dir %>/sass/*.scss'
        // watch for changes in any of the files below, which will trigger a rebuild and reload of page
        watch: {
            all: {
                files: ['<%= src_dir %>/js/*.js'],
                tasks: ['copy'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['<%= src_dir %>/js/*.js'],
                tasks: ['jshint:all'],
                options: {
                    livereload: true
                }
            },
            sass: {
                files: 'sass/**/*.scss',
                tasks: ['sass', 'cssmin'],
                options: {
                    livereload: true
                }
            },
            jekyll: {
                files: ['<%= docs_dir %>/_layouts/*.html', '<%= docs_dir %>/_includes/*.html', '<%= docs_dir %>/js/*.js', '<%= docs_dir %>/_plugins/*', '<%= docs_dir %>/_posts/*', '<%= docs_dir %>/css/docs.css', '<%= docs_dir %>/index.html'],
                tasks: ['jekyll']
            },
        },

        //Docs tasks

        jekyll: {
          options: {
            src: '<%= docs_dir %>'
          },
            dist: {
              options: {
                dest: './docs/_site'
              }
            }
        },

        sass: {
            dist: {
                files: {
                    '<%= docs_dir %>/css/docs.css': 'docs/_sass/main.scss'
                }
            }
        },

        // http://192.168.1.143:3001/
        browserSync: {
            bsFiles: {
                src: ['<%= docs_dir %>/_site/css/*.css']
            },
            options: {
                // proxy: 'localhost',
                // port: 3333,
                watchTask: true,
                ghostMode: {
                    clicks: true,
                    scroll: true,
                    links: true,
                    forms: true
                }
            },
            server: {
                baseDir: '<%= docs_dir %>/_site'
            }
        },


        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        // index: {

        //   /**
        //    * During development, we don't want to have wait for compilation,
        //    * concatenation, minification, etc. So to avoid these steps, we simply
        //    * add all script files directly to the `<head>` of `index.html`. The
        //    * `src` property contains the list of included files.
        //    */
        //   build: {
        //     dir: '<%= build_dir %>',
        //     src: [
        //       '<%= build_dir %>/js/*.js',
        //       '<%= build_dir %>/css/*.css'
        //     ]
        //   }
        // }

    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));


    grunt.registerTask('docsBuild', ['sass', 'uglify', 'copy', 'jekyll']);
    grunt.registerTask('docs', ['docsBuild', 'browserSync', 'watch']);

    grunt.registerTask('build', ['uglify', 'copy']);
    grunt.registerTask('default', ['build', 'connect', 'watch']);


    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS(files) {
        return files.filter(function(file) {
            return file.match(/\.js$/);
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS(files) {
        return files.filter(function(file) {
            return file.match(/\.css$/);
            //return file.match(/^(?:(?!.min\.css$).)*\.css$/);
        });
    }

    /**
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask('index', 'Process index.html template', function() {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + ')\/', 'g');
        var jsFiles = filterForJS(this.filesSrc).map(function(file) {
            return file.replace(dirRE, '');
        });
        var cssFiles = filterForCSS(this.filesSrc).map(function(file) {
            return file.replace(dirRE, '');
        });

        grunt.file.copy('index.html', this.data.dir + '/index.html', {
            process: function(contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config('pkg.version')
                    }
                });
            }
        });
    });



};