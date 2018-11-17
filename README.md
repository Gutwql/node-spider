### node-spider
## 依赖
fs文件库模块
https请求
iconv编码
mkdirp目录
request请求
async异步
cheerio页面容器选择模块

## node爬虫技术主要分两方面

# 读页面
通过http请求拉取页面结构及数据，iconv调整编码（如有必要），解析页面NodeList
# 保存
mkdirp增删改目录，fs判断文件状态，request的pipe方法完成写文件流操作

以保存图片为例：
<pre>
const dir = './epio';
const filename = 'test';
// 创建目录
mkdirp(dir, function(err) {
  if (err) {
    console.log(err);
  }
});
const img = dir + "/" + filename + '.jpg';
request.head(url, function(err, res, body) {
  request(url)
    .on('error', function(err) {
        console.log(err);
    })
    .pipe(fs.createWriteStream(img))
    .on('close', callback);
</pre>
## 参考
https://blog.csdn.net/i_peter/article/details/53374728

http://www.jb51.net/article/77626.htm
