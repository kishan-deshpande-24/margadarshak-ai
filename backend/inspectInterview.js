require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Interview = require('./src/models/Interview');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const doc = await Interview.findById('6a31fb4d45d366690922004a').lean();
    console.log(JSON.stringify(doc, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
