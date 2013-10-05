
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		
    typescript: {
      base: {
        src: ['app/**/*.ts'],
        dest: 'public/editor.js',
				 options: {
          target: 'es5', //or es3
          sourcemap: true,
          fullSourceMapPath: true,
          declaration: true,
        }
      }
    },
		
		less: {
			base: {
				src: ['theme/editor.less'],
				dest: 'public/editor.css'
			}
		},
		
		sync: {
			base: {
				files: [
					{
						src: 'resources/**',
						dest: 'public/'
					},
					{
						src: 'views/**',
						dest: 'public/'
					},
					{
						src: 'index.html',
						dest: 'public/'
					},
				]
			}
		},
		
		clean: ['public/']
  });

	grunt.loadNpmTasks('grunt-sync');
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('clean', ['clean']);
	
	grunt.registerTask('publish', ['typescript', 'less', 'sync']);
  grunt.registerTask('default', ['publish']);

};