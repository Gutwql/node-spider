var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');

var index = 1; //页面数控制
var url = 'http://www.ygdy8.net/html/gndy/dyzz/list_23_';
var titles = []; //用于保存title

function getTitle(url, i) {
    console.log("正在获取第" + i + "页的内容");
    http.get(url + i + '.html', function(sres) {
        var chunks = [];
        sres.on('data', function(chunk) {
            chunks.push(chunk);
        });
        sres.on('end', function() {
            var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
            var $ = cheerio.load(html, { decodeEntities: false });
            $('.co_content8 .ulink').each(function(idx, element) {
                var $element = $(element);
                titles.push({
                    title: $element.text()
                })
            })
            if (i < 2) { //为了方便只爬了两页
                getTitle(url, ++index); //递归执行，页数+1
            } else {
                console.log(titles);
                console.log("Title获取完毕！");
            }
        });
    });
}

function main() {
    console.log("开始爬取");
    getTitle(url, index);
}

main(); //运行主函数