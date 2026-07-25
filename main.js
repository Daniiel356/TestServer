const http = require('http');
const { WebSocketServer, WebSocket } = require('ws'); 

const PORT = process.env.PORT || 3000;
let host=null;
const clients=[];

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
    const conn=add(e);

    e.on('message', (message) => {
        const msgString = message.toString();
        send(conn, msgString);
    });

    e.on('close', ()=>{
        const index=clients.findIndex((e)=>e.id==conn.id);
        if(index==-1)return;
        clients.splice(index, 1);
        if(host.id==conn.id)host=clients[0]||-1;
    })
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function send(client, msg){
    if(host.id==-1)return;
    if(host.id==client.id){
        wss.clients.forEach((c) => {
            if(c !== client.ws && c.readyState === WebSocket.OPEN) {
                c.send(msg);
            }
        });
    }else{
        if (host!==-1 &&host.ws.readyState === WebSocket.OPEN)host.ws.send(msg);
    }
}

function add(ws){
    let nextId = 0;

    while (clients.some(c => c.id === nextId)) {
        nextId++;
    }
    const client={ws, id: nextId}
    if(host==-1)host=client;
    clients.push(client);
    return client;
}