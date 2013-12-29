module.exports = function (grunt)
{
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.title %> v<%= pkg.version %> | Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.homepage %> | Released under the MIT License */\n',
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.js': ['src/*.js']
                }
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'dist/<%= pkg.name %>.v<%= pkg.version %>.zip'
                },
                files: [
                    {
                        src: ['LICENSE', 'README.md'],
                        dest: '<%= pkg.name %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['<%= pkg.name %>.js'],
                        dest: '<%= pkg.name %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['*.js'],
                        dest: '<%= pkg.name %>/src/',
                        filter: 'isFile'
                    }
                ]
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                es3: true,
                forin: true,
                freeze: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                browser: true,
                globals: {
                    jQuery: true,
                    Zepto: true,
                    define: true,
                    module: true
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

            // Publishes the release on GitHub pages.

            publish: {
                command: [
                    'echo "Storing required resources in dist..."',
                    'mkdir -pv dist',
                    'cp -f package.json dist/package.json',
                    'echo "Cleaning working tree..."',
                    'rm -Rf content',
                    'rm -Rf tmp',
                    'echo "Stashing current changes..."',
                    'git stash',
                    'echo "Checking out gh-pages..."',
                    'git checkout gh-pages',
                    'echo "Creating base directories..."',
                    'mkdir -p content',
                    'mkdir -p tmp',
                    'echo "Updating documentation..."',
                    'touch dist/docs.json',
                    'cp -f dist/docs.json content/docs.json',
                    'echo "Updating package.json..."',
                    'cp -f dist/package.json content/package.json',
                    'echo "Staging..."',
                    'git add content/*.json',
                    'echo "Committing changes..."',
                    'git diff-index --quiet HEAD || git commit -m "Update dist."',
                    'echo "Restoring previous branch..."',
                    'git checkout -',
                    'echo "Removing trash..."',
                    'rm -Rf dist',
                    'rm -Rf content',
                    'rm -Rf download',
                    'rm -Rf tmp',
                    'echo "Restoring working tree..."',
                    'git stash pop'
                ].join('&&'),
                options: {
                    stdout: true
                }
            }
        },

        qunit: {
            options: {
                timeout: 60000
            },
            all: ['test/*.html']
        }
    });

    grunt.registerTask('updatePackage', function () {
        grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('default', ['test', 'build']);

    grunt.registerTask('jsdoc', function ()
    {
        grunt.task.run('shell:jsdoc');
    });

    grunt.registerTask('publish', function ()
    {
        grunt.task.run('jsdoc');
        grunt.task.run('compress');
        grunt.task.run('shell:publish');
    });

    grunt.registerTask('travis', ['jshint', 'qunit', 'build']);

    grunt.registerTask('release', function (type)
    {
        if (!type) {
            type = 'patch';
        }

        grunt.task.run('test');
        grunt.task.run('bumpup:' + type);
        grunt.task.run('updatePackage');
        grunt.task.run('build');
        grunt.task.run('tagrelease');
        grunt.registerTask('publish');
    });
};
