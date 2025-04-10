#!/usr/bin/env node

const { YoutubeTranscript } = require('../dist/youtube-transcript.common.js');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Parse command-line arguments
const args = process.argv.slice(2);
const videoId = args[0];
const proxyIndex = args.indexOf('--proxy');
const proxyUrl = proxyIndex !== -1 && args.length > proxyIndex + 1 ? args[proxyIndex + 1] : null;
const forceDisableProxy = args.includes('--no-proxy-check'); // For debugging only

function showUsage() {
  console.log(`
Usage: node fetch-transcript.js <videoId|videoUrl> [--proxy <proxyUrl>]

Options:
  --proxy <url>    Use the specified proxy URL (e.g., http://192.168.178.2:8118)

Examples:
  node fetch-transcript.js dQw4w9WgXcQ
  node fetch-transcript.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  node fetch-transcript.js dQw4w9WgXcQ --proxy http://192.168.178.2:8118
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
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { proxy: proxyUrl });
      
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