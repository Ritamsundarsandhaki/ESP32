const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Map to track connected ESP32 devices
const devices = new Map();

// Handle WebSocket connection
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection");

  let deviceID = null;

  ws.on("message", (message) => {
    console.log("Received:", message);
    const data = JSON.parse(message);

    // Handle device registration
    if (data.type === "register_device") {
      deviceID = data.deviceID;
      devices.set(deviceID, ws);
      console.log(`Device registered: ${deviceID}`);
    }

    // Handle other messages (e.g., fingerprint or attendance)
    if (data.type === "register_response") {
      console.log(`Fingerprint data from ${deviceID}:`, data.fingerprint);
      // Process fingerprint registration...
    }

    if (data.type === "attendance") {
      console.log(`Attendance from ${deviceID}:`, data.fingerprint);
      // Process attendance record...
    }
  });

  ws.on("close", () => {
    if (deviceID) {
      devices.delete(deviceID);
      console.log(`Device disconnected: ${deviceID}`);
    }
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

// REST API endpoint to send a command to a specific ESP32
app.post("/send-command/:deviceID", (req, res) => {
  const deviceID = req.params.deviceID;
  const deviceSocket = devices.get(deviceID);

  if (deviceSocket) {
    const command = { type: "register" }; // Example command
    deviceSocket.send(JSON.stringify(command));
    res.status(200).json({ message: `Command sent to device ${deviceID}` });
  } else {
    res.status(404).json({ message: `Device ${deviceID} not connected` });
  }
});
