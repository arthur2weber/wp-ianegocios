'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

const create = require("sulla").create;
const Whatsapp = require("sulla").Whatsapp;
const fs = require('fs');

app.get('/start/:id', function (req, res) {
	
  const id_sessao = req.params.id;
  const png = 'session/'+id_sessao+'/qrcode.png';
  create('session/'+id_sessao, (base64Qr, asciiQR) => {
    console.log(asciiQR);
    exportQR(base64Qr, png);
  }).then(client => start(client));

  //res.send('<br><div style="text-align:center"><img src="/qr" /></div><meta http-equiv="refresh" content="30">')
  res.sendFile(path.join(__dirname, png))
})

app.use('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(' ');
  //res.write('<br><div style="text-align:center"><img src="/qr" /></div><meta http-equiv="refresh" content="3">');
  res.end();
});


module.exports = app;
module.exports.handler = serverless(app);


function exportQR(qrCode, path) {
  qrCode = qrCode.replace('data:image/png;base64,', '');
  const imageBuffer = Buffer.from(qrCode, 'base64');
  fs.writeFileSync(path, imageBuffer);
}

function start(client) {
  client.onMessage(message => {
    if (message.body.length>0 && message.isGroupMsg==false) {
	const currentHour = new Date().getHours();
	const greetingMessage =
	  currentHour >= 5 && currentHour < 12 ? // after 4:00AM and before 12:00PM
	  'Bom dia' :
	  currentHour >= 12 && currentHour <= 18 ? // after 12:00PM and before 6:00pm
	  'Boa tarde' :
	  currentHour > 18 || currentHour < 5 ? // after 5:59pm or before 4:00AM (to accommodate night owls)
	  'Boa noite' : // if for some reason the calculation didn't work
	  'Olá'
	  
		client.sendText(message.from,greetingMessage+' '+message.sender.pushname+'!');
		//client.sendText(message.from,greetingMessage+' '+message.sender.pushname+'! somos a Fit Fat Food, nesse período de quarentena ?? estamos atendendo apenas para entregas ??, Clique no link para fazer seu pedidos: https://gg.gg/Lalala_pedidos ??');
    }	
  }); 
}