#!/usr/bin/env node

const { YoutubeTranscript } = require('../dist/youtube-transcript.common.js');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Parse command-line arguments
const args = process.argv.slice(2);
const videoId = args[0];

// Handle both --proxy url and --proxy=url formats
let proxyUrl = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--proxy' && args.length > i + 1) {
    proxyUrl = args[i + 1];
    break;
  } else if (args[i].startsWith('--proxy=')) {
    proxyUrl = args[i].split('=')[1];
    break;
  }
}

const forceDisableProxy = args.includes('--no-proxy-check'); // For debugging only

function showUsage() {
  console.log(`
Usage: node fetch-transcript.js <videoId|videoUrl> [--proxy <proxyUrl> | --proxy=<proxyUrl>]

Options:
  --proxy <url>      Use the specified proxy URL (e.g., http://192.168.178.2:8118)
  --proxy=<url>      Alternative format for proxy URL

Examples:
  node fetch-transcript.js dQw4w9WgXcQ
  node fetch-transcript.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  node fetch-transcript.js dQw4w9WgXcQ --proxy http://192.168.178.2:8118
  npm run transcript -- dQw4w9WgXcQ --proxy=http://192.168.178.2:8118
`);
}

async function fetchTranscript() {
  if (!videoId) {
    console.error('Error: Please provide a YouTube video ID or URL as an argument');
    showUsage();
    process.exit(1);
  }

  try {
    if (proxyUrl) {
      console.log(`Fetching transcript for: "${videoId}" via proxy: ${proxyUrl}`);
    } else {
      console.log(`Fetching transcript for: "${videoId}" (no proxy)`);
    }
    
    
    try {
      // Try to get the transcript
      console.log('Attempting to fetch transcript...');
      let transcript = await YoutubeTranscript.fetchTranscript(videoId, { proxy: proxyUrl });
      transcript = transcript[0];
      console.log(JSON.stringify(transcript, null, 2));
      console.log(`Successfully fetched ${transcript.length} transcript segments`);

    } finally {
    }
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    
    // Provide a more helpful error message for proxy-related errors
    if (error.message.includes('ECONNREFUSED') && proxyUrl) {
      console.error(`\nThe proxy server at ${proxyUrl} could not be reached.`);
      console.error('Please check that the proxy is running and the URL is correct.');
    }
    
    process.exit(1);
  }
}

fetchTranscript(); 