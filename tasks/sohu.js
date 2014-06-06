module.exports = function(grunt) {
    var helper = require('./lib/helper.js').init(grunt);

    var diff_table = [];
    var minified_files = [];

    function run_minify(diff_table) {
        var src_files = diff_table.filter(function(item) {
            return (item.flag === 'M' || item.flag === 'A')
                && helper.is_js_file(item.file)
                && helper.is_inc_file(item.file) === false
        });

        return src_files.map(function(item) {
            return helper.minify(item.file) ;
        });
    }

    function run_copysources(diff_table) {
        var src_files = diff_table.filter(function(item) {
            return (item.flag === 'M' || item.flag === 'A')
                && helper.is_js_file(item.file) === false;
        });

        return src_files.map(function(item) {
            return helper.copy(item.file);
        });
    }

    function run_automodify(minified_files) {
        var incs = helper.get_allinc_files();

        var modified_files = incs.filter(function(item) {
            return helper.automodify_inc(item, minified_files);
        });

        modified_files.forEach(function(file) {
            helper.minify(file, {chksumFileName: false});
        });

        return modified_files;
    }


    grunt.task.registerTask('sohu-diff', '显示当前分支最近一次提交与最后一次上线版本间代码差异。', function() {
        var done = this.async();
        helper.get_diff_table(function(difftable){
            diff_table = difftable;
            console.dir(difftable);
            done(true);
        });
    });

    grunt.task.registerTask('sohu-incs','显示当前项目所有inc文件。', function() {
        var files = helper.get_allinc_files();
        console.log(files)
        files.forEach(function(item){
            // grunt.log.ok(123)
            grunt.log.ok(item);
        });
    });

    grunt.task.registerTask('sohu-cleanbuild', '清空(build)目录。', function() {
        helper.clean_build_dir();
    });

    grunt.task.registerTask('sohu-copysources', '将修改或追加资源文件输出到(build)目录。', function() {
        if(diff_table && diff_table.length)  {
            minified_files = run_copysources(diff_table);
            return;
        }
        var done = this.async();
        helper.get_diff_table(function(difftable){
            diff_table = difftable;
            minified_files = run_copysources(diff_table);
            done(true);
        });
    });

    grunt.task.registerTask('sohu-minify', '将修改或追加JS文件压缩并输出到(build)目录。', function() {
        if(diff_table && diff_table.length)  {
            minified_files = run_minify(diff_table);
            return;
        }
        var done = this.async();
        helper.get_diff_table(function(difftable){
            diff_table = difftable;
            minified_files = run_minify(diff_table);
            done(true);
        });
    });

    grunt.task.registerTask('sohu-automodify', '自动修改dict.js | **/inc.js', function() {
        if(minified_files && minified_files.length) {
            run_automodify(minified_files);
            return;
        }
        grunt.log.error('自动修改(dict.js | **/inc.js)前必须执行`sohu-minify`任务');
    });



    grunt.task.registerTask('sohu', '获取差导->导出差异资源文件->导出差异JS文件并压缩输出->自动修改inc文件', ['sohu-diff', 'sohu-copysources' ,'sohu-minify', 'sohu-automodify']);

}