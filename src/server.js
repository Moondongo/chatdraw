const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

//Inicializacion
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

//settings
app.set('port', process.env.PORT || 3000);

//sockets
require('./sockets')(io);

//archivos estaticos
app.use(express.static(__dirname+'/public'));

//Arrancando servidor
server.listen(app.get('port'), () =>{
    console.log(`Server Running in port ${app.get('port')}`);
})