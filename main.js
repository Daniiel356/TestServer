const http = require('http');
const { WebSocketServer } = require('ws');

// Render asigna el puerto automáticamente en process.env.PORT
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor WebSocket activo');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Cliente conectado exitosamente');

    ws.on('message', (message) => {
        console.log(`Mensaje recibido: ${message}`);
        ws.send(`Eco: ${message}`);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
