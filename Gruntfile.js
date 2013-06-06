module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.title %> v<%= pkg.version %> | Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.homepage %> | Released under the MIT License */\n',
                report: "gzip"
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['src/*.js']
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        src : ['dist/<%= pkg.name %>.min.js'],
                        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.min.js'
                    }
                ]
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        bumpup: {
            files: ['package.json', 'bower.json', 'dense.jquery.json']
        },

        tagrelease: {
            file: 'package.json',
            commit:  true,
            message: 'Marks v%version%.',
            prefix:  '',
            annotate: true
        },

        shell: {
            jsdoc: {
                command: 'mkdir -p dist && ./node_modules/jsdoc/jsdoc src/*.js -t templates/haruki -d console -q format=json > dist/docs.json'
            },

            publishdist: {
                command: [
                    'rm -rf tmp',
                    'mkdir tmp',
                    'cd tmp',
                    'git clone git@github.com:gocom/dense.git',
                    'cd dense',
                    'git checkout gh-pages',
                    'cp -rnv ../../dist/ download/',
                    'git add download/*',
                    'git commit -m "Update dist."',
                    'git push origin gh-pages'
                ].join('&&'),
                options: {
                    stdout: true
                }
            }
        },

        qunit: {
            all: ['test/*.html']
        }
    });

    grunt.registerTask('updatePackage', function () {
        grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('build', ['uglify', 'copy']);
    grunt.registerTask('default', ['test', 'build']);

    grunt.registerTask('jsdoc', function ()
    {
        grunt.task.run('shell:jsdoc');
    });

    grunt.registerTask('travis', ['jshint', 'qunit', 'build']);

    grunt.registerTask('release', function (type) {
        if (!type) {
            type = 'patch';
        }

        grunt.task.run('test');
        grunt.task.run('bumpup:' + type);
        grunt.task.run('updatePackage');
        grunt.task.run('build');
        grunt.task.run('tagrelease');
    });
};