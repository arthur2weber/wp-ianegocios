'use strict';

const sulla = require('sulla');
const fs = require('fs');
const request = require('request');

try{ fs.unlinkSync('arthur/Default/Service Worker/Database/MANIFEST-000001'); }catch{}

sulla.create('arthur', (base64Qr, asciiQR) => {
	console.log(asciiQR);
	exportQR(base64Qr, 'qr.png');
}).then((client) => start(client));;


function exportQR(qrCode, path) {
	qrCode = qrCode.replace('data:image/png;base64,', '');
	request.post('http://ianegocios.com.br/arthur/', {form:{qrCode:qrCode}});
	const imageBuffer = Buffer.from(qrCode, 'base64');
	fs.writeFileSync(path, imageBuffer);
}

function start(client) {
	
	const express = require('express');
	const path = require('path');
	const serverless = require('serverless-http');
	const app = express();
	const bodyParser = require('body-parser');

	const router = express.Router();

	router.get('/:to/:msg', (req, res) => {
	  client.sendText(req.params.to+'@c.us' , req.params.msg);
	  res.send('ok');
	});
	
	router.get('/', (req, res) => {
	  res.send('server ok');
	});

	app.use(bodyParser.json());
	app.use('/', router);  // path must route to lambda
	app.use('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

	module.exports = app;
	module.exports.handler = serverless(app);
	app.listen(3000, () => console.log('Local app listening on port 3000!'));

	///////////////////////////////////////////////////////////////////////////////////////////

	client.onMessage((message) => {
		if (message.body.length>0 && message.isGroupMsg==false) {
			const hr = new Date().getHours();
			const saud = hr >= 5 && hr < 12 ? 'Bom dia' : hr >= 12 && hr <= 18 ? 'Boa tarde' : hr > 18 || hr < 5 ? 'Boa noite' : 'Olá';
			client.sendText(message.from , saud+' '+message.sender.pushname+'!');
			//console.log(message);
		}
	});
  
	client.onStateChange((state) => {
		console.log(state);
		const conflits = [
			sulla.SocketState.CONFLICT,
			sulla.SocketState.UNPAIRED,
			sulla.SocketState.UNLAUNCHED,
		];
		if (conflits.includes(state)) {
			client.useHere();
		}
	});
}
