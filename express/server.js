'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();


app.use('/public', express.static('public'));

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<br><div style="text-align:center"><img src="/qr" /></div><meta http-equiv="refresh" content="3">');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/qr', (req, res) => res.sendFile(path.join(__dirname, '../public', 'qr.png')));
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../public', 'index.html')));




module.exports = app;
module.exports.handler = serverless(app);
