const http = require('http'),
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  proxy = require('http-proxy');
const proxyServer = proxy.createProxyServer({});
const port = process.env.PORT || 3000;

function getImage(url, cb) {
  console.log('url', url);
  let path = 'https://image-t.chaiding.com' + url;
  http.get(path, function (res) {
    var imgData = '';
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      imgData += chunk;
    });

    res.on('end', function () {
      console.log('download url');
      fs.writeFile(url, imgData, 'binary', function (err) {
        if (err) {
          return console.log('download fail', url);
        }
        console.log(url);
      });
      cb && cb(imgData);
    });
  });
}

const server = http.createServer((req, res) => {
  // 获取解析后的url对象
  const pathObj = url.parse(req.url, true);
  // 后台api
  if (pathObj.pathname.indexOf('/ruankao') > -1) {
    // getImage(pathObj.pathname, (image) => {
    //   res.write(image, 'binary');
    //   res.end();
    // });
    proxyServer.web(req, res, { target: 'https://image-t.chaiding.com' });
    return;
  }
  // 资源路径
  const filePath = path.join(__dirname, pathObj.pathname);
  console.log(filePath);
  fs.readFile(filePath, (err, file) => {
    if (err) {
      console.error('404');
      res.end('<h1>404 not found</h1>');
    } else {
      console.log('success');
      // 二进制
      res.write(file, 'binary');
      res.end();
    }
  });
});

server.listen(port);
console.log(`server start on http://127.0.0.1:${port}`);
