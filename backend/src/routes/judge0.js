const router = require('express').Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

router.use(protect);

router.post('/execute', async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    const LANGUAGE_IDS = { javascript: 63, python: 71, java: 62, cpp: 54, c: 50, typescript: 74 };
    const languageId = LANGUAGE_IDS[language] || 63;
    
    const submitRes = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      source_code: code,
      language_id: languageId,
      stdin: stdin || ''
    }, {
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });
    
    const result = submitRes.data;
    res.json({
      success: true,
      output: result.stdout || result.stderr || result.compile_output || 'No output',
      status: result.status?.description,
      time: result.time,
      memory: result.memory,
      passed: result.status?.id === 3
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
