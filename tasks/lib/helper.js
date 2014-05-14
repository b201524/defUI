var Iconv  = require('iconv').Iconv;
var UglifyJS = require('uglify-js');

var crypto = require('crypto');
var path = require('path');
var jschardet = require('jschardet');
var exec = require('child_process').exec;

module.exports.init = function(grunt) {
    var exports = {};
    var config = grunt.config('sohu') || {};

    exports.exec = exec;

    exports.get_build_dir = function() {
        return config.buildDir || 'build';
    }

    exports.clean_build_dir = function() {
        grunt.file.recurse(this.get_build_dir(), function(abspath) {
            grunt.file.delete(abspath);
            grunt.log.ok('deleted: %s', abspath);
        });
        grunt.file.delete(this.get_build_dir());
    }

    /*
     * 获取指定范围内的所inc文件
     * */
    exports.get_allinc_files = function() {
        var scope = config.incScope || [];
        var files = [];
        scope.forEach(function(item) {
            files = files.concat(grunt.file.expand(item))
        });
        return files;
    }

    exports.is_js_file = function(file) {
        return /\.js$/.test(file);
    }

    exports.is_inc_file = function(file) {
        return /(inc|dict)\.js$/.test(file);
    }

    exports.get_build_path = function(file) {
        return path.join(this.get_build_dir(), file);
    }

    exports.get_debug_path = function(file) {
        return path.join(this.get_build_dir(), '/debug/', file);
    }

    exports.get_release_path = function(file) {
        return path.join(this.get_build_dir(), '/release/', file);
    }

    /*
     * 获取当前分支最近一次提交与最后一次线上版本间代码差异
     * */
    exports.get_diff_table = function(callback) {
        var diffcmd =  grunt.option('cmd') || 'git diff origin/master HEAD --raw';

        exec(diffcmd, function(error, stdout, stderr) {
            if(error) {
                grunt.log.error(error || stderr);
                callback([]);
                return
            }

            var parse = function(content) {
                var table = [];
                content.split(grunt.util.linefeed).forEach(function(line) {
                    if(line) {
                        var sp4 =  line.split(' ')[4].split('\t');
                        table.push({flag: sp4[0].trim(), file: sp4[1].trim()});
                    }
                });
                return table;
            }

            var table = parse(stdout);

            if(table.length > 0) {
                grunt.log.writeln('GIT DIFF TABLE-----------------------------------------------------');
                grunt.log.write(stdout);
                grunt.log.writeln('--------------------------------------------------------------');
            } else {
                grunt.log.error('当前分支与远程分支无任何差异。');
            }

            callback(table) ;
        });
        return;
    }

    exports.content_md5 = function(content, length) {
        var md5 = crypto.createHash('md5');
            md5.update(content, 'utf8');
        return md5.digest('hex').substring(0, length || 32);
    }


    //如果文件流是gbk自动转成utf8
    exports.read_file = function(file) {
        var buffer = grunt.file.read(file, {encoding: null});
        //TODO: 如果文件不是utf-8则认为它就是gbk, 这里不严谨。
        var encoding = '';
        try {
            encoding = (jschardet.detect(buffer).encoding || '').toUpperCase();
            if(encoding != 'UTF-8') {
                var iconv = new Iconv('GBK', 'UTF-8');
                buffer = iconv.convert(buffer);
            }
        } catch(e) {
            grunt.log.error('error: %s encoding:%s', file, encoding);
            buffer = [];
        }
        return buffer;
    }

    exports.write_file = function(file, buffer) {
        grunt.file.write(file, buffer, {encoding: 'UTF-8'});
    }

    exports.copy = function(file) {
//        var debugPath =  this.get_debug_path(file);
//        var releasePath = this.get_release_path(file);
//        grunt.file.copy(file, debugPath);
//        grunt.file.copy(file, releasePath);

        var buildPath = this.get_build_path(file);
        grunt.file.copy(file, buildPath)
        grunt.log.oklns('copied:  %s', buildPath);
        return file;
    }

    exports.minify = function(file, options) {
        options = options || {
            chksumFileName:true
        };

        var buffer = this.read_file(file);

        //压缩文件加上md5戳保存到build
        var newfile = file;
        if(options.chksumFileName) {
            var chksum = this.content_md5(buffer, 6);
            newfile = [path.dirname(file), '/', path.basename(file, '.js') , '_' , chksum , '.js'].join('');
        }

        var result = UglifyJS.minify(buffer.toString('utf-8'), {
            fromString: true,
            output: {
                ascii_only:true
            }
        });
        var releasePath = this.get_build_path(newfile);
        var banner = (grunt.option('author') || 'Team') + ':'
            banner += grunt.template.date(new Date(), 'yyyy-mm-dd h:MM:ss TT');

        this.write_file(releasePath,'\/*! ' + banner +' *\/\n' + result.code);
        grunt.log.oklns('minified:  %s', releasePath);
        return newfile;
    }

    exports.automodify_inc = function(file, pathArr) {
        var cutpath = function(path) {
            return path.replace(/^js\//, '');       //源代码中的“js/”被映射到js.tv.itc.cn域名
        }
        var convert_to_reg = function(path) {       //把路径转换成正则表达式，用于在源文件中完成替换
            var regstr = path.replace('/', '\\\/').replace(/_\w+\.js/, '((_\\w+)|(\\d+))?\\.js');
            return new RegExp(regstr);
        }
        var buffer = this.read_file(file);
        if(buffer.length == 0) {                    //空文件不做处理
            return false;
        }
        var content = buffer.toString('utf-8');
        pathArr.forEach(function(item) {
            var path = cutpath(item);
            var reg = convert_to_reg(path);
            content = content.replace(reg, path);
        });
        var buffer2 = new Buffer(content, 'utf-8');

        var md5a = this.content_md5(buffer);
        var md5b = this.content_md5(buffer2);
        if(md5a !== md5b) {
            this.write_file(file, content);
            grunt.log.oklns('replaced:  %s', file);
            return true;
        }
        return false;
    }

    return exports
}
