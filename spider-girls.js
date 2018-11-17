var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
const https = require('https')
var request = require("request");
var async = require("async");
var iconv = require('iconv-lite');
var mkdirp = require('mkdirp');

var index = 1; //页面数控制
var root = 'https://999av.vip';
// var url = 'https://999av.vip/html/tupian/qingchun/index';
var url = 'https://999av.vip/html/tupian/yazhou/index';
var titles = []; //用于保存title
// let headers = {
//     authority: '999av.vip',
//     method: 'GET',
//     path: '/html/tupian/qingchun/2018/0322/412356.html',
//     scheme: 'https',
//     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
//     accept-encoding: 'gzip, deflate, br',
//     accept-language: 'zh-CN,zh;q=0.9',
//     cache-control: 'max-age=0',
//     cookie: '__cfduid=d34c44d68b17f881eec4137606c7cf52d1525006693; Hm_lvt_4ab4576ab990d89616b2b6dc90c03dc1=1525006674; Hm_lpvt_4ab4576ab990d89616b2b6dc90c03dc1=1525024447',
//     if-modified-since: 'Sun, 29 Apr 2018 01:00:43 GMT',
//     referer: 'https://999av.vip/html/tupian/qingchun/index.html',
//     upgrade-insecure-requests: 1,
//     user-agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
// }

function getTitle(url, i) {

    https.get(url + i + '.html', function(sres) {
        // console.log("statusCode: ", sres.statusCode);
        // console.log("headers: ", sres.headers);
        var chunks = [];
        sres.on('data', function(chunk) {
            chunks.push(chunk);
        });
        sres.on('end', function() {
            console.log("正在获取第" + i + "页的内容");
            var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
            var $ = cheerio.load(html, { decodeEntities: false });
            $('.art ul li a').each(function(idx, element) {
                var $element = $(element);
                const t = $element.text();
                const h = $element.attr('href');
                titles.push({
                    title: t,
                    href: h,
                })
                getDetail(t, h); //获取页详情
            })
            if (i = 1) {
                getTitle(url, '');
            } else if (i < 313) { //为了方便只爬了两页
                getTitle(url + '_', ++index); //递归执行，页数+1
            } else {
                // console.log(titles);
                console.log("Title获取完毕！");
            }
        });
    });
}

function getDetail(t, h) {
    var dir = './spider-girls/' + t;
    console.log("正在获取 " + t + " 的内容");
    https.get(root + h, function(sres) {
        console.log("statusCode: ", sres.statusCode);
        console.log("headers: ", sres.headers);
        var chunks = [];
        var srcs = [];
        sres.on('data', function(chunk) {
            chunks.push(chunk);
        });
        sres.on('end', function() {
            var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
            var $ = cheerio.load(html, { decodeEntities: false });
            // 创建目录
            mkdirp(dir, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            $('.imgbody p img').each(function(idx, element) {
                    if (idx === 0) return;
                    var $element = $(element);
                    var src = $element.attr('src').replace('//i1.1100lu.xyz/', 'https://i1.cache2.us/');
                    // var src = 'http:' + $element.attr('src');
                    console.log('---->', idx, src);
                    download(src, dir, idx + src.substr(-4, 4), function() {
                        console.log('done');
                    })

                    srcs.push(src);
                    var src1 = src.replace('https://i1.cache2.us/', 'https://i1.cache3.us/');
                    srcs.push(src1);
                })
                // downloadImg(srcs, dir, 5)
            console.log(t + " 图片获取完毕！");
        });
    });
}
//下载方法
var download = function(url, dir, filename, callback) {
    request.head(url, function(err, res, body) {
        // request(url).on('error', function(err) { if (err) { console.log(err); } }).pipe(fs.createWriteStream(dir + "/" + filename));
        request(url)
            .on('error', function(err) {
                console.log(err);
            })
            .pipe(fs.createWriteStream(dir + "/" + filename))
            .on('close', callback);
    });
    // request({ uri: url, encoding: 'binary' }, function(error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         fs.writeFile(dir, body, 'binary', function(err) {
    //             if (err) { console.log(err); }
    //         });
    //     }
    // });
};

var downloadImg = function(photos, dir, asyncNum) {
    console.log("即将异步并发下载图片，当前并发数为:" + asyncNum);
    let i = 1;
    async.mapLimit(photos, asyncNum, function(photo, callback) {
        const filename = i + photo.substr(-4, 4);
        if (filename) {
            console.log('正在下载' + photo);
            // 默认
            // fs.createWriteStream(dir + "/" + filename)
            // 防止pipe错误
            request(photo)
                .on('error', function(err) {
                    console.log(err);
                })
                .pipe(fs.createWriteStream(dir + "/" + filename));
            console.log('下载完成');
            i++;
            callback(null, filename);
        }
    }, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(" all right ! " + result);
        }
    })
}

function main() {
    console.log("开始爬取......");
    getTitle(url, index);
}

main(); //运行主函数