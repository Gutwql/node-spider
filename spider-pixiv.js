const fs = require('fs');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https')
const request = require("request");
const async = require("async");
const iconv = require('iconv-lite');
const mkdirp = require('mkdirp');

const pageUrl = 'https://www.pixiv.net/member_illust.php?mode=manga&illust_id=68718522';
const imgUrls = [];
const dir = './umbra/';

const downloadImg = function(photos, dir, asyncNum) {
    console.log("即将异步并发下载图片，当前并发数为:" + asyncNum, photos);
    let i = 1;
    async.mapLimit(photos, asyncNum, function(photo, callback) {
        const filename = i + photo.substr(-4, 4);
        console.log(photo, filename);
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
    https.get(pageUrl, function(sres) {
        const chunks = [];
        sres.on('data', function(chunk) {
            chunks.push(chunk);
        });
        sres.on('end', function() {
            const html = iconv.decode(Buffer.concat(chunks), 'utf-8');
            const $ = cheerio.load(html, { decodeEntities: false });
            // 创建目录
            mkdirp(dir, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            // console.log('els--->', $('#main .item-container'));
            $('#main .item-container').forEach(element => {
                const $element = $(element).children('img');
                const src = $element.attr('data-src');
                console.log('el--->', $element);
                imgUrls.push(src);
            });
            // downloadImg(imgUrls, dir, 2);
        });
    });
}

main(); //运行主函数