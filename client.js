import { WebSocket, WebSocketServer } from 'ws';
import inquirer from 'inquirer';

const ws = new WebSocket('ws://localhost:8080', {
  perMessageDeflate: false
});

function promptUserInput() {
  inquirer.prompt({
    type: 'input',
    name: 'message',
    message: 'Type a message (type exit to quit the chat):',
  }).then(userMessage => {
    if (userMessage.message.toLowerCase() === 'exit') {
      ws.close();
      console.log('You have left the chat.');
      return;
    } else {
      ws.send(JSON.stringify({ type: 'chat', message: userMessage }));
      promptUserInput();
    }
  });
}


ws.on('open', () => {
  inquirer.prompt({ type: 'input', name: 'username', message: 'Enter your user name:' }).then(name => {
    ws.send(JSON.stringify({ type: 'username', username: name.username }));
    promptUserInput();
  });
});

ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.type === 'chat') {
    console.log('\n' + message.message);
  } else if (message.type === 'system') {
    console.log('\n' + message.message);
  }
};

ws.on('close', () => {
  console.log('Goodbye');
})