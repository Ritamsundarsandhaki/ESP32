const WebSocket = require('ws');

// Use the PORT environment variable or fallback to 8080 for local testing
const PORT = process.env.PORT || 8080;

// Create a WebSocket server
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Client connected from ${ip}`);

    // Handle messages from the client
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Send a response back to the client
        ws.send(`Server says: You sent "${message}"`);
    });

    // Handle client disconnections
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

console.log(`WebSocket server is running and listening on port ${PORT}`);
