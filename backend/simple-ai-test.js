// Simple AI test server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const virusTotalService = require('./services/virusTotalService');
const huggingFaceService = require('./services/huggingFaceService');

const app = express();
app.use(cors());
app.use(express.json());

// Simple AI test endpoint
app.post('/test-ai', async (req, res) => {
  console.log('🚀 SIMPLE AI TEST ENDPOINT HIT!');
  console.log('Request body:', req.body);
  
  try {
    const { text, url } = req.body;
    let results = { success: true };
    
    // Test text
    if (text) {
      console.log('Testing text analysis...');
      const textResult = await huggingFaceService.analyzeText(text);
      results.textAnalysis = textResult;
      console.log('Text result:', textResult);
    }
    
    // Test URL
    if (url) {
      console.log('Testing URL analysis...');
      const urlResult = await virusTotalService.scanUrl(url);
      results.urlAnalysis = urlResult;
      console.log('URL result:', urlResult);
    }
    
    res.json(results);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5001; // Different port
app.listen(PORT, () => {
  console.log(`🔥 Simple AI test server running on http://localhost:${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/test-ai -H "Content-Type: application/json" -d '{"text":"URGENT! Click here!"}'`);
});