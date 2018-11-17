var cheerio = require('cheerio');
var https = require('https');
var iconv = require('iconv-lite');
var mkdirp = require('mkdirp');
var request = require("request");
var async = require("async");

var url = 'https://image.baidu.com/search/index?tn=baiduimage&ct=201326592&lm=-1&cl=2&ie=gbk&word=%B2%BB%C4%DC%C2%EE%C8%CB%20%B1%ED%C7%E9%B0%FC&fr=ala&ala=1&alatpl=adress&pos=0&hs=2&xthttps=111111';


https.get(url, function(sres) {
    var chunks = [];
    var dir = './spider-biaoqin/';
    sres.on('data', function(chunk) {
        chunks.push(chunk);
    });
    sres.on('end', function() {
        var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
        var $ = cheerio.load(html, { decodeEntities: false });
        var imgs = [];
        // 创建目录
        mkdirp(dir, function(err) {
            if (err) {
                console.log(err);
            }
        });
        $('#imgid .main_img').children().each(function(idx, element) {
            var $element = $(element);
            var src = $element.attr('src')
            console.log(idx, src)
            imgs.push(src);
        })
        console.log(imgs)
            // downloadImg(imgs, dir, 2);
    });
});

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