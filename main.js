const http = require('http');
const { WebSocketServer, WebSocket } = require('ws'); 

const PORT = process.env.PORT || 3000;
let host = null;
const clients = [];

const server = http.createServer((req, res) => {
    if (req.url === '/simular-dormir') {
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end('Servidor apagándose...');
        
        console.log('Cerrando el servidor voluntariamente para pruebas...');
        
        wss.close(() => {
            process.exit(0); 
        });
        return;
    }
    res.writeHead(200, { 
        'Content-Type': 'text/plain', 
        'Access-Control-Allow-Origin': '*'
    });
    res.end('Servidor WebSocket activo');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (e) => {
    const conn = add(e);

    e.on('message', (message) => {
        // CORRECCIÓN: Convertimos el Buffer de ws a string de texto legible
        const msgText = message.toString();
        send(conn, msgText);
    });

    e.on('close', () => {
        const index = clients.findIndex((item) => item.id === conn.id);
        if (index === -1) return;
        clients.splice(index, 1);

        if (host && host.id === conn.id && clients.length !== 0) {
            host = clients[0];
            sendJSON(host, { type: "hostChange", host: true });
        }
        if (clients.length === 0) host = null;

        console.log("Cliente", conn.id, "desconectado");
        console.log("host:", host?.id);
    });

    // CORRECCIÓN: Evitamos crash usando host?.id de forma segura
    sendJSON(conn, { id: conn.id, host: host?.id === conn.id });
    console.log("Cliente conectado con la id: " + conn.id);
    console.log("host:", host?.id);
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function send(client, msg) {
    if (host === null) return;
    
    if (host.id === client.id) {
        clients.forEach((c) => {
            if (c.ws !== client.ws && c.ws.readyState === WebSocket.OPEN) {
                try {
                    const parsed = JSON.parse(msg);
                    sendJSON(c, parsed);
                } catch {
                    sendJSON(c, msg);
                }
            }
        });
    } else {
        if (host.ws.readyState === WebSocket.OPEN) {
            try {
                const parsed = JSON.parse(msg);
                sendJSON(host, parsed);
            } catch {
                sendJSON(host, msg);
            }
        }
    }
}

function sendJSON(dest, obj) {
    // CORRECCIÓN: Validamos que dest y dest.ws existan para mitigar cualquier error en tiempo de ejecución
    if (dest && dest.ws && dest.ws.readyState === WebSocket.OPEN) {
        dest.ws.send(JSON.stringify(obj));
    }
}

function add(ws) {
    let nextId = 0;

    while (clients.some(c => c.id === nextId)) {
        nextId++;
    }
    const client = { ws, id: nextId };
    if (host === null || clients.length === 0) host = client;
    clients.push(client);
    return client;
}
