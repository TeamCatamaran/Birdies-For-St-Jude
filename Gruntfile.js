module.exports = function (grunt) {

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        sass: {
            dist: {
                files: {
                    'assets/main.css': 'assets/scss/main.scss'
                }
            }
        },

        cssmin: {
            options: {
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
                files: {
                    'assets/main.min.css': 'assets/main.css'
                }
            }
        },

        concat: {
            dist: {
                files: {
                    'assets/app.js': ['assets/js/namespaces.js', 'assets/js/pledgeit/**/*.js', 'assets/js/birdiesforstjude/**/*.js']
                }
            },
        },

        uglify: {
            build: {
                files: {
                    'assets/app.min.js': 'assets/app.js'
                }
            }
        },

        watch: {
            css: {
                files: 'assets/scss/**/*.scss',
                tasks: ['sass', 'cssmin', 'uglify']
            },
            js: {
                files: 'assets/js/**/*.js',
                tasks: ['concat', 'uglify']
            }
        }

    });

    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // ===========================================================================
    // CREATE TASKS ==============================================================
    // ===========================================================================
    grunt.registerTask('default', ['sass', 'concat', 'watch']);
    grunt.registerTask('build', ['sass', 'concat', 'cssmin', 'uglify']);
};
