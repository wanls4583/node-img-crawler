var Crawler = require('../index.js');

new Crawler({
	postDir: 'post',
	excludeHosts: ['wanls4583.github.io'],
	targetHost: 'https://wanls4583.github.io/',
	replaceUrl: true
}).crawlImg();