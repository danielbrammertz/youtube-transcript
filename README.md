# youtube-transcript

> This is a fork of [Kakulukian/youtube-transcript](https://github.com/Kakulukian/youtube-transcript)

[![npm version](https://badge.fury.io/js/youtube-transcript.svg)](https://badge.fury.io/js/youtube-transcript)

I wanted to extract a transcript from a youtube video but there was only a python script so I created this to do it in node.
This package use unofficial YTB API so it can be broken over the time if no update appears.

## Changes in this fork

This fork adds the following improvements to the original project:

- Added support for fetching transcripts through a proxy server
- Improved error handling and reporting
- Added a CLI tool for easy transcript retrieval from the command line
- Added proxy verification to ensure proper connectivity before attempting transcript fetch
- Better documentation and examples for proxy usage

## Installation

```bash
$ npm i youtube-transcript
```

or

```bash
$ yarn add youtube-transcript
```

## Usage

```js
import { YoutubeTranscript } from 'youtube-transcript';

YoutubeTranscript.fetchTranscript('videoId or URL').then(console.log);
```

### Methods

- fetchTranscript(videoId: string [,options: TranscriptConfig]): Promise<TranscriptResponse[]>;

## Using with Proxy

### In JavaScript Code

```js
import { YoutubeTranscript } from 'youtube-transcript';

// Configure with proxy
const options = {
  proxy: 'http://your-proxy-server:port'
};

// Fetch transcript using proxy
YoutubeTranscript.fetchTranscript('videoId or URL', options).then(console.log);
```

### Using the CLI

The included CLI tool can fetch transcripts directly from the command line:

```bash
# Fetch transcript without proxy
node scripts/fetch-transcript.js dQw4w9WgXcQ

# Fetch transcript with proxy
node scripts/fetch-transcript.js dQw4w9WgXcQ --proxy http://your-proxy-server:port

# Fetch transcript from a full YouTube URL
node scripts/fetch-transcript.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --proxy http://your-proxy-server:port
```

## License

**[MIT](LICENSE)** Licensed
