/* Express App */
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import compression from 'compression'
import customLogger from '../utils/logger'

const create = require("sulla").create;
const Whatsapp = require("sulla").Whatsapp;
const fs = require('fs');

/* My express App */
export default function expressApp(functionName) {
  const app = express()
  const router = express.Router()

  // gzip responses
  router.use(compression())

  // Set router base path for local dev
  const routerBasePath = process.env.NODE_ENV === 'dev' ? `/${functionName}` : `/.netlify/functions/${functionName}/`




  /* define routes */
  router.get('/:id/start', (req, res) => {

    const id_sessao = req.params.id;
    const png = 'session/'+id_sessao+'/qrcode.png';
    create('session/'+id_sessao, (base64Qr, asciiQR) => {
      console.log(asciiQR);
      exportQR(base64Qr, png);
    }).then(client => start(client));
  

    const html = ` n =  `+req.params.id;
    res.send(html)
  })

  router.get('/users', (req, res) => {
    res.json({
      users: [
        {
          name: 'steve',
        },
        {
          name: 'joe',
        },
      ],
    })
  })

  router.get('/hello/', function(req, res) {
    res.send('hello world')
  })

  // Attach logger
  app.use(morgan(customLogger))

  // Setup routes
  app.use(routerBasePath, router)

  // Apply express middlewares
  router.use(cors())
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))

  return app
}



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