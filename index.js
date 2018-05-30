var request = require('request')
var fs = require('fs')
var path = require('path')


class Crawler {
    /**
     * @param  {object} option 
     * {
     *   isLog: 是否显示日志,
     *   imagesDir: 图片存储目录,
     *   postDir: 文章目录,
     *   excludeHosts: 需要排除爬取的图片链接域名列表,
     *   targetHost: 替换文章图片链接时的目标域名(只有replaceUrl为true才有效)
     *   replaceUrl: 是否替换文章图片链接
     * }
     */
    constructor(option) {
        this.isLog = option.isLog != undefined ? option.isLog : true;
        this.imagesDir = option.imagesDir || 'images';
        this.postDir = option.postDir || '';
        this.excludeHosts = option.excludeHosts instanceof Array ? option.excludeHosts : [];
        this.targetHost = option.targetHost || '';
        this.replaceUrl = option.replaceUrl || false;
    }
    /**
     * 创建目录
     * @param  {string}   dirname  需要创建的目录
     * @param  {function} callback 回调函数
     */
    mkdirs(dirname, callback) {
        var This = this;
        var exists = fs.existsSync(dirname);
        if (!exists) {
            This.mkdirs(path.dirname(dirname), function() {
                fs.mkdirSync(dirname);
            });
            typeof callback === 'function' && callback();
        } else {
            typeof callback === 'function' && callback();
        }
    }
    /**
     * 读取文章
     * @param  {string}   dirname  根目录
     * @param  {function} callback 回调函数
     */
    crawlImg(dirname,callback) {
        var This = this;
        var dirname = dirname || this.postDir;
        fs.exists(dirname, function(exists) {
            if (!exists) {
                return;
            } else {
                fs.stat(dirname, function(err, stat) {
                    if (stat && stat.isDirectory()) { //如果是子目录，递归读取所有子目录中的文件
                        fs.readdir(dirname, function(err, arr) {
                            if (arr.length > 0) {
                                for (var i = 0; i < arr.length; i++) {
                                    arr[i] = dirname + '/' + arr[i];
                                    (function(num) {
                                        This.crawlImg(arr[num], function() {
                                            if (num == arr.length - 1) {
                                                if (This.isLog) {
                                                    console.log('read dir complete:', dirname);
                                                    console.log('-----------------------------------------');
                                                }
                                            }
                                        });
                                    })(i)
                                }
                            } else {
                                if (This.isLog) {
                                    console.log('read dir complete:', dirname);
                                    console.log('-----------------------------------------');
                                }
                            }
                        });
                    } else if (stat.isFile()) { //读取文件
                        var post = fs.readFileSync(dirname, { encoding: 'utf-8' });
                        if (This.isLog) {
                            console.log('read file:', dirname);
                            console.log('-----------------------------------------');
                        }
                        This.searchImgUrl(dirname, post);
                        typeof callback === 'function' && callback(post);
                    }
                });
            }
        });
    }
    /**
     * 搜索文章中的需要下载和替换的图片链接
     * @param  {string} filePath 文章路径
     * @param  {string} post    文章内容
     */
    searchImgUrl(filePath, post) {
        let This = this;
        _search(/<img[^<]+?src=['"](?:http|https).+?['"]/mg); //img标签
        _search(/!\[[^\[\<]*?\]\((?:http|https)[^\[\<]*?\)/mg); //markdown图片链接

        function _search(reg) {
            var match = post.match(reg); //全局搜索
            if (match) {
                var loaded = false;
                for (var i = 0; i < match.length; i++) {
                    var tmp = '';
                    if (match[i].indexOf('<img') > -1) { //匹配img标签
                        tmp = match[i].match(/<img[\s\S]*?src=['"](.+?)['"]/);
                    } else {
                        tmp = match[i].match(/\[[^\[\<]*?\]\(([^\[\<]*?)\)/);
                    }
                    var ifLoad = true;
                    for (var j = 0; j < This.excludeHosts.length; j++) { //排除有指定域名的url
                        if (tmp[1].indexOf(This.excludeHosts[j]) > -1) {
                            ifLoad = false;
                            break;
                        }
                    }
                    if (ifLoad) {
                        post = This.download(filePath, post, tmp[1], i + 1);
                        loaded = true;
                    }
                }
                if (loaded) {
                    //重新写入替换图片链接后的文章内容
                    fs.writeFileSync(filePath, post);
                }
            }
        }
    }
    /**
     * 下载文件
     * @param  {string} filePath 文章目录
     * @param  {string} post    文章内容
     * @param  {string} url     图片链接
     * @param  {number} index   新生成图片链接的序号(同一篇文章)
     */
    download(filePath, post, url, index) {
        var This = this;
        var dir = path.dirname(filePath);
        dir = This.imagesDir + '/' + dir;

        this.mkdirs(dir, function() {
            var basename = path.basename(filePath);
            if (basename.indexOf('.') > -1) {
                var ext = path.extname(basename);
                basename = basename.slice(0, -ext.length) + '-' + index;
            }
            var ext = path.extname(url).slice(0, 4);
            if (ext == '.jpg' || ext == '.png' || ext == '.gif' || ext == '.bmp') {
                basename += ext;
            } else {
                basename += '.jpg';
            }
            var fullPath = dir + '/' + basename;
            if (This.isLog) {
                console.log('downloading:', url);
                console.log('creating:', fullPath);
                console.log('-----------------------------------------');
            }

            request(url).pipe(fs.createWriteStream(fullPath));

            //替换文章中的图片链接
            post = post.replace(url, This.targetHost + fullPath);
        });

        return post;
    }
}

module.exports = Crawler;