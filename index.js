const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


const create = require("sulla").create;
const Whatsapp = require("sulla").Whatsapp;
const fs = require('fs');


// Writes QR in specified path
function exportQR(qrCode, path) {
  qrCode = qrCode.replace('data:image/png;base64,', '');
  const imageBuffer = Buffer.from(qrCode, 'base64');

  // Creates 'marketing-qr.png' file
  fs.writeFileSync(path, imageBuffer);
}

create('session/48996965191', (base64Qr, asciiQR) => {
  // To log the QR in the terminal
  console.log(asciiQR);
  // To write it somewhere else in a file
  exportQR(base64Qr, 'public/qr.png');
}).then(client => start(client));

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
		//client.sendText(message.from,greetingMessage+' '+message.sender.pushname+'! somos a Fit Fat Food, nesse período de quarentena 😷 estamos atendendo apenas para entregas 🛵, Clique no link para fazer seu pedidos: https://gg.gg/Lalala_pedidos 👈');
    }	
  });
  
}