const http = require('http');
const { WebSocketServer, WebSocket } = require('ws'); 

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/plain', 
        'Access-Control-Allow-Origin': '*'
    });
    res.end('Servidor WebSocket activo');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Cliente conectado exitosamente');

    ws.on('message', (message) => {
        const msgString = message.toString();
        send(ws, msgString);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function send(client, msg){
    wss.clients.forEach((c) => {
        if (c !== client && c.readyState === WebSocket.OPEN) {
            c.send(msg);
        }
    });
}