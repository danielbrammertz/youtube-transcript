#!/usr/bin/env node

const { YoutubeTranscript } = require('../dist/youtube-transcript.common.js');

async function fetchTranscript() {
  const videoId = process.argv[2];
  
  if (!videoId) {
    console.error('Please provide a YouTube video ID or URL as an argument');
    process.exit(1);
  }
  
  try {
    console.log(`Fetching transcript for: "${videoId}"`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(JSON.stringify(transcript, null, 2));
    console.log(`Successfully fetched ${transcript.length} transcript segments`);
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    process.exit(1);
  }
}

fetchTranscript(); 