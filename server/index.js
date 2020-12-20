require('newrelic');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fetch = require('node-fetch');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/photos/:productid/:styleid', createProxyMiddleware({
  target: process.env.PHOTO_GALLERY_URL,
  changeOrigin: true
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = 80;

app.listen(port, () => {
  console.log(`Hugo's proxy server listening on port ${port}`);
});
