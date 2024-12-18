const express = require("express");
require("dotenv").config();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Replace with your App ID and App Certificate from Agora
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

// Ensure environment variables are loaded correctly
if (!APP_ID || !APP_CERTIFICATE) {
  console.error("APP_ID and APP_CERTIFICATE must be set in the environment.");
  process.exit(1);
}

app.use(cors());

// Default token expiration time in seconds (3600 = 1 hour)
const DEFAULT_EXPIRATION_TIME = process.env.TOKEN_EXPIRATION || 3600;

console.log(
  "APP_ID:",
  APP_ID,
  "APP_CERTIFICATE:",
  APP_CERTIFICATE,
  "EXPIRATION:",
  DEFAULT_EXPIRATION_TIME
);

// Generate a token
app.get("/generateToken", (req, res) => {
  // Get required query parameters
  const channelName = req.query.channelName; // Livestream channel name
  const role = req.query.role || "publisher"; // 'publisher' or 'subscriber'
  const uid = req.query.uid
    ? parseInt(req.query.uid, 10)
    : Math.floor(Math.random() * 100000); // Generate random UID if not provided

  // Validate channelName
  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  // Validate role
  const rtcRole =
    role.toLowerCase() === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Calculate expiration time
  const currentTime = Math.floor(Date.now() / 1000); // Current UNIX timestamp
  const privilegeExpireTime =
    currentTime + parseInt(DEFAULT_EXPIRATION_TIME, 10);

  try {
    // Generate token using the RtcTokenBuilder
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      rtcRole,
      privilegeExpireTime
    );

    console.log(`Token generated: ${token}`);

    // Respond with the token and other details
    return res.json({
      token,
      channelName,
      uid,
      role,
      privilegeExpireTime,
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(port, () => {
  console.log(`Token server listening at http://localhost:${port}`);
});
