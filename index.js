const express = require("express");
require("dotenv").config();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const cors = require("cors"); // Import cors package
const app = express();
const port = process.env.PORT || 3000;

// Replace with your App ID and App Certificate from Agora
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

app.use(cors());
// Token expiration time in seconds
const expirationTimeInSeconds = process.env.TOKEN_EXPIRATION;

// Generate a token
app.get("/generateToken", (req, res) => {
  // Required query parameters
  const channelName = req.query.channelName; // Livestream channel name
  const uid = req.query.uid || 0; // Use 0 for a random UID (optional)
  const role = req.query.role || "publisher"; // 'publisher' or 'subscriber'

  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  // Set role for the user
  const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Calculate expiration time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expirationTimeInSeconds;

  // Generate token using the RtcTokenBuilder
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    rtcRole,
    36000,
    privilegeExpireTime
  );

  return res.json({
    token,
    channelName,
    uid,
    role,
    privilegeExpireTime,
  });
});

app.listen(port, () => {
  console.log(`Token server listening at http://localhost:${port}`);
});
