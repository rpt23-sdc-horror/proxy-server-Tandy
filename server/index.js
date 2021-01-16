// require('newrelic');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fetch = require('node-fetch');
const redis = require('redis');

const app = express();

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PW,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));


const getFromRedis = (req, res, next) => {
  client.get(`${Number(req.params.productid)}-${req.params.styleid}`, (err, data) => {
    if(err) throw err;
    if(data !== null) {
      client.expire(`${Number(req.params.productid)}-${req.params.styleid}`, 600);

      const photos = JSON.parse(data);
      res.send([photos.photo_urls.main_photo.regular_url, ...photos.photo_urls.other_photos])
    } else {
      next();
    }
  });
}

app.use('/photos/:productid/:styleid', getFromRedis, createProxyMiddleware({
  target: process.env.PHOTO_GALLERY_URL,
  changeOrigin: true
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = 8080;

app.listen(port, () => {
  console.log(`Hugo's proxy server listening on port ${port}`);
});
