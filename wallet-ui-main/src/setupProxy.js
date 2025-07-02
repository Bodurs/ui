const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // Sadece /api ile başlayan istekleri yönlendir
    createProxyMiddleware({
      target: 'http://localhost:3002', // Backend sunucusu
      changeOrigin: true, // Hedef sunucunun orijinini değiştir
      pathRewrite: {
        '^/api': '', // /api önekini kaldır
      },
    })
  );
};