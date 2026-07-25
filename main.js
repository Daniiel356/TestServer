const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*'});
    res.end('Servidor WebSocket activo');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Cliente conectado exitosamente');

    ws.on('message', (message) => {
        send(ws, message);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function send(client, msg){
    wss.clients.forEach((c)=>{
        if(c!=client && c.readyState==WebSocket.OPEN){
            c.send(msg);
        };
    });
}