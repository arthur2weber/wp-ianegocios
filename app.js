const sulla = require('sulla');
const fs = require('fs');
try{
	fs.unlinkSync('session/Default/Service Worker/Database/MANIFEST-000001');
}catch{}
sulla.create('session', (base64Qr, asciiQR) => {
  console.log(asciiQR);
  exportQR(base64Qr, 'qr.png');
}).then((client) => start(client));;

function exportQR(qrCode, path) {
  qrCode = qrCode.replace('data:image/png;base64,', '');
  const imageBuffer = Buffer.from(qrCode, 'base64');
  fs.writeFileSync(path, imageBuffer);
}


function start(client) {
  client.onMessage((message) => {
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