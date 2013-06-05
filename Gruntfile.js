module.exports = function (grunt)
{
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            project: {
                command: [
                    'rm -rf tmp',
                    'mkdir tmp',
                    'cd tmp',
                    'git clone git@github.com:gocom/dense.git',
                    'cd dense',
                    'npm install'
                ].join('&&'),
                options: {
                    stdout: true
                }
            },

            build: {
                command: [
                    'cd tmp/dense',
                    'grunt build',
                    'ditto dist ../../download',
                    'cp dist/dense.min.js ../../assets/js/dense.min.js'
                ].join('&&'),
                options: {
                    stdout: true
                }
            },

            jsdoc: {
                command: './node_modules/jsdoc/jsdoc tmp/dense/src/*.js -t templates/haruki -d console -q format=json > content/docs.json'
            }
        }
    });

    grunt.registerTask('publish', function ()
    {
        grunt.task.run('shell:project');
    });

    grunt.registerTask('build', function ()
    {
        grunt.task.run('shell:build');
        grunt.task.run('shell:jsdoc');
    });
};