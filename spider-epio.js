var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
const https = require('https')
var request = require("request");
var async = require("async");
var iconv = require('iconv-lite');
var mkdirp = require('mkdirp');
// const titleJson = require('./girlimg.epio.app.1.json');
// const imgJson = require('./girlimg.epio.app.json');
const imgJson = require('./girlimg.epio.app.4.json');
// const imgJson = require('./girlimg.epio.app.3.json');

function getDetail() {
    false && titleJson.forEach((e, idx) => {
        e = e.match(/>(.*)</)[1];
        var dir = './epio';
        // console.log("正在获取 " + e + " 的内容");
        // 创建目录
        mkdirp(dir, function(err) {
            if (err) {
                console.log(err);
            }
        });
        download(imgJson[idx], dir, idx, function() {
            console.log(e + " 图片获取完毕！");
        });
        // downloadImg(imgJson, dir, 1, function() {
        //     console.log(e + " 图片获取完毕！");
        // });
    });
    var dir = './epio';
    imgJson.forEach((e, idx) => {
        download(imgJson[idx], dir, 2442 + idx, function() {
            console.log(e + " 图片获取完毕！");
        });
    });
}
//下载方法
function download(url, dir, filename, callback) {
    const img = dir + "/" + filename + '.jpg';
    fs.exists(img, function(exists) {
        if (exists) {
            const state = fs.statSync(img);
            if (state.size) return;

            setTimeout(function() {
                request.head(url, function(err, res, body) {
                    request(url)
                        .on('error', function(err) {
                            console.log(err);
                        })
                        .pipe(fs.createWriteStream(img))
                        .on('close', callback);
                });
            }, 1000);
        } else {
            setTimeout(function() {
                request.head(url, function(err, res, body) {
                    request(url)
                        .on('error', function(err) {
                            console.log(err);
                        })
                        .pipe(fs.createWriteStream(img))
                        .on('close', callback);
                });
            }, 1000);
        }
    });
};

var downloadImg = function(photos, dir, asyncNum) {
    console.log("即将异步并发下载图片，当前并发数为:" + asyncNum);
    let i = 1;
    async.mapLimit(photos, asyncNum, function(photo, callback) {
        const filename = i;
        if (filename) {
            // 防止pipe错误
            request(photo)
                .on('error', function(err) {
                    console.log(err);
                })
                .pipe(fs.createWriteStream(dir + "/" + filename + '.jpg'))
                .on('close', callback);
            console.log(filename + '下载完成');
            i++;
        }
    }, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(" all right ! " + result);
        }
    })
}
console.log("开始爬取......");
getDetail();