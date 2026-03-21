const https = require('https');

const apiKey = 'AIzaSyDF8GBc5ERtk7a0-x0xtFfqnIHlE83vdx0';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const models = parsed.models.map(m => m.name).filter(n => n.includes('gemini'));
      console.log('Available Gemini models:', models);
    } catch (e) {
      console.error('Parse error:', e, data);
    }
  });
}).on('error', err => {
  console.error('Request error:', err);
});
