# node-img-crawler
> 一个简单的图片爬虫模块，基于nodejs

## 内容

- [**`功能特性`**](#功能特性)
- [**`安装`**](#安装)
- [**`使用`**](#使用)
- [**`案例`**](#使用)
- [**`配置项`**](#配置项)   
- [**`历史版本`**](#历史版本)
- [**`注意`**](#注意)
- [**`贡献`**](#贡献)


## 功能特性
* [x] 基于nodejs实现
* [x] 批量爬取
* [x] 配置多满足多样需求
* [x] 持续维护迭代

## 安装

### NPM

```bash
npm install node-img-crawler --save
```

## 使用

```js
var Crawler = require('../index.js');

new Crawler({
	isLog: true,
	postDir: 'post',
	excludeHosts: ['wanls4583.github.io'],
	targetHost: 'https://wanls4583.github.io/',
	replaceUrl: true
}).crawlImg();
```

## 案例
请查看[**`example`**](https://github.com/wanls4583/node-img-crawler/tree/master/example)

## 配置项
|key|description|default|val|
|:---|---|---|---|
|`isLog`|是否打印日志|`true`|`Boolean`|
|`imagesDir`|图片存储目录|`images`|`String`|
|`excludeHosts`|需要排除爬取的图片链接域名列表|`[]`|`Array`|
|`targetHost`|替换文章图片链接时的目标域名（只有replaceUrl为true才有效）|`空字符串`|`String`|
|`replaceUrl`|是否替换文章图片链接|`false`|`Boolean`|


## 历史版本
See the GitHub [历史版本](https://github.com/wanls4583/vue-infinite-auto-scroll/releases).


## 贡献
欢迎给出一些意见和优化，期待你的 `Pull Request`