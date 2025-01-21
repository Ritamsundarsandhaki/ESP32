const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");

let fingerprintData = []; // Array to store multiple fingerprints
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

let esp32Socket = null;

// Handle WebSocket connection
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    console.log("Received from ESP32:", message);
    const data = JSON.parse(message);

    // Handle registration response
    if (data.type === "register_response") {
      console.log("Fingerprint data received:", data.fingerprint);
      fingerprintData.push(data.fingerprint); // Store fingerprint data in an array
    }

    // Handle attendance response
    if (data.type === "attendance") {
      console.log("Attendance recorded:", data.fingerprint);
    }
  });

  // Assign ESP32 socket
  esp32Socket = ws;

  ws.on("close", () => {
    console.log("ESP32 disconnected");
    esp32Socket = null;
  });
});

// HTTP server for REST API
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Upgrade HTTP to WebSocket
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

// REST API endpoint to send register command to ESP32
app.post("/register", (req, res) => {
  if (esp32Socket) {
    console.log("Sending register command to ESP32");
    esp32Socket.send(JSON.stringify({ type: "register" }));
    res.status(200).json({ message: "Register command sent to ESP32" });
  } else {
    res.status(500).json({ message: "ESP32 not connected" });
  }
});

// REST API endpoint to get the fingerprint data
app.get("/data", (req, res) => {
  res.status(200).json({ fingerprints: fingerprintData });
});

// REST API endpoint to get a specific fingerprint by ID
app.get("/data/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const fingerprint = fingerprintData[id - 1]; // Assuming ID is 1-indexed
  if (fingerprint) {
    res.status(200).json({ fingerprint });
  } else {
    res.status(404).json({ message: "Fingerprint not found" });
  }
});
