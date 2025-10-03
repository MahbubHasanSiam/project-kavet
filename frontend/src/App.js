import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Update if deploying

function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    // Fetch existing messages
    fetch('http://localhost:5000/messages')
      .then(res => res.json())
      .then(data => setMessages(data));

    // Listen for new messages
    socket.on('receive_message', msg => {
      setMessages(prev => [...prev, msg]);
    });

    // Cleanup
    return () => socket.off('receive_message');
  }, []);

  const sendMessage = e => {
    e.preventDefault();
    if (username && text) {
      socket.emit('send_message', { username, text });
      setText('');
    }
  };

  return (
    <div>
      <h1>Kavet Chat</h1>
      <form onSubmit={sendMessage}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          placeholder="Type a message"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>
            <strong>{msg.username}:</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;