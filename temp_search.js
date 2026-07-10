const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/maggi/.gemini/antigravity/brain/906381d9-103f-414d-b73f-6771502cf4d6/.system_generated/logs/transcript.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('USER_EXPLICIT')) {
    try {
      const j = JSON.parse(line);
      if (j.content) {
        const text = j.content.toLowerCase();
        if (text.includes('vercel') || text.includes('render') || text.includes('netlify') || text.includes('supabase') || text.includes('hosting') || text.includes('siti')) {
          console.log('--- USER SAID:');
          console.log(j.content);
        }
      }
    } catch(e) {}
  }
});
