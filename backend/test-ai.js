// Quick test of AI services
require('dotenv').config();
const virusTotalService = require('./services/virusTotalService');
const huggingFaceService = require('./services/huggingFaceService');

async function testAI() {
  console.log('🧪 Testing AI services...');
  
  // Test Hugging Face
  try {
    console.log('📝 Testing Hugging Face with suspicious text...');
    const textResult = await huggingFaceService.analyzeText('URGENT! Click here to verify your account immediately!');
    console.log('Hugging Face result:', textResult);
  } catch (error) {
    console.error('Hugging Face error:', error.message);
  }
  
  // Test VirusTotal  
  try {
    console.log('🔍 Testing VirusTotal with Google URL...');
    const urlResult = await virusTotalService.scanUrl('https://google.com');
    console.log('VirusTotal result:', urlResult);
  } catch (error) {
    console.error('VirusTotal error:', error.message);
  }
}

testAI().then(() => {
  console.log('✅ AI test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ AI test failed:', error);
  process.exit(1);
});