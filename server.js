import { WebSocket, WebSocketServer } from 'ws';

const clientsMap = new Map();

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    if (data.type === 'username') {
      console.log(`Hello ${data.username}`);

      clientsMap.set(ws, data.username);
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'system', message: `Welcome to the chatroom ${data.username}` }));
        }
      });
    } else if (data.type === 'chat') {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({ type: 'chat', message: `${clientsMap.get(ws)}: ${data.message.message}` }));
        }
      });
    }
  });

  ws.on('close', () => {
    let userName = clientsMap.get(ws);
    clientsMap.delete(ws);
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`${userName} has left the chat`);
      }
    });
  });
});

