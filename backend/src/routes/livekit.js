const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { AccessToken } = require('livekit-server-sdk');
const { v4: uuidv4 } = require('uuid');

router.use(protect);

router.post('/token', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    const room = roomName || `room-${uuidv4().slice(0, 8)}`;
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: identity || req.user._id.toString(),
      name: req.user.fullName
    });
    token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true, canPublishData: true });
    const jwt = await token.toJwt();
    res.json({ success: true, token: jwt, roomName: room, livekitUrl: process.env.LIVEKIT_URL });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
