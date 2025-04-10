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

// Verify the proxy is actually working before trying to use it
async function verifyProxy(proxyUrl, fetch) {
  if (!proxyUrl || forceDisableProxy) {
    return true; // No proxy to verify or verification disabled
  }
  
  console.log(`Verifying proxy connection to ${proxyUrl}...`);
  try {
    // Create proxy agent
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    
    // Try to make a request through the proxy to a known endpoint
    const response = await fetch('https://checkip.amazonaws.com', {
      agent: proxyAgent,
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Proxy test failed with status: ${response.status}`);
    }
    
    const proxyIp = await response.text();
    console.log(`✅ Proxy is working. Your IP through proxy: ${proxyIp.trim()}`);
    return true;
  } catch (error) {
    console.error(`❌ Proxy verification failed: ${error.message}`);
    console.error(`The proxy server at ${proxyUrl} could not be reached or is not working properly.`);
    console.error('Please check that the proxy is running and the URL is correct.');
    return false;
  }
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
    
    // Import node-fetch dynamically (since it's ESM-only in v3)
    const nodeFetch = await import('node-fetch');
    const fetch = nodeFetch.default;
    
    // Verify proxy connection before proceeding
    if (proxyUrl && !await verifyProxy(proxyUrl, fetch)) {
      throw new Error(`Cannot proceed: proxy verification failed for ${proxyUrl}`);
    }
    
    // Create a proxy agent if a proxy URL was provided
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;
    
    // Create a custom fetcher function that uses our proxy if provided
    const customFetch = (url, options = {}) => {
      // Ensure options has headers
      options.headers = options.headers || {};
      
      // Add the proxy agent to the fetch options if provided
      if (proxyAgent) {
        options.agent = proxyAgent;
      }
      
      return fetch(url, options);
    };
    
    // Temporarily override the global fetch
    const originalGlobalFetch = global.fetch;
    global.fetch = customFetch;
    
    try {
      // Try to get the transcript
      console.log('Attempting to fetch transcript...');
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      console.log(JSON.stringify(transcript, null, 2));
      console.log(`Successfully fetched ${transcript.length} transcript segments`);
      if (proxyUrl) {
        console.log('✅ Transcript was fetched through the proxy');
      }
    } finally {
      // Always restore the original fetch
      global.fetch = originalGlobalFetch;
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