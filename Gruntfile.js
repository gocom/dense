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
            }
        }
    });

    grunt.registerTask('publish', function ()
    {
        grunt.task.run('shell:project');
    });
};