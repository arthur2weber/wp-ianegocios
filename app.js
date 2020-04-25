const sulla = require('sulla');
const fs = require('fs');

const request = require('request');

try{ fs.unlinkSync('arthur/Default/Service Worker/Database/MANIFEST-000001'); }catch{}

sulla.create('arthur', (base64Qr, asciiQR) => {
	console.log(asciiQR);
	exportQR(base64Qr, 'qr.png');
	request.post('http://ianegocios.com.br/arthur/', {form:{qrCode:asciiQR}})
}).then((client) => start(client));;

function exportQR(qrCode, path) {
	qrCode = qrCode.replace('data:image/png;base64,', '');
	const imageBuffer = Buffer.from(qrCode, 'base64');
	fs.writeFileSync(path, imageBuffer);
	
	var formData = {
		file: fs.createReadStream(path),
	};
}

function start(client) {
	client.onMessage((message) => {
		if (message.body.length>0 && message.isGroupMsg==false) {
			const hr = new Date().getHours();
			const saud = hr >= 5 && hr < 12 ? 'Bom dia' : hr >= 12 && hr <= 18 ? 'Boa tarde' : hr > 18 || hr < 5 ? 'Boa noite' : 'Olá';
			client.sendText(message.from,saud+' '+message.sender.pushname+'!');
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