var fs = require('fs');
var md5 = function (data, len) {
	if (typeof data == 'number') {
		data = String(data);
	}
	var crypto = require('crypto'),
		md5sum = crypto.createHash('md5'),
		encoding = typeof data === 'string' ? 'utf8' : 'binary';
	md5sum.update(data, encoding);
	len = len || 32;
	return md5sum.digest('hex').substring(0, len);
};

var len = 1000;
var filename = 'authIdKeys.txt';
// si03E8A863CF095E7A42ED9699E7D84F48
// 如果存在，则删除文件
if (fs.existsSync(filename)) {
	fs.unlinkSync(filename);
}

// 循环写入

for (var i = 0; i < len; i++) {
	var str = new Date().getTime() + parseInt(Math.random() * 100000);
	var md5Str = md5(str).toUpperCase();
	fs.appendFileSync(filename, 'si' + md5Str + '\n');
}
