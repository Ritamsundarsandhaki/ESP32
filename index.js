const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 8080;

// Create HTTP server (without SSL)
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Client connected from ${ip}`);

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Server says: You sent "${message}"`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Respond to the HTTP request from ESP32
app.get('/', (req, res) => {
    console.log("HTTP request received from ESP32");
    res.status(200).send("WebSocket server is available");  // Respond with availability message
});

// Start the server
server.listen(PORT, () => {
    console.log(`WebSocket server is running on http://localhost:${PORT}`);
});
