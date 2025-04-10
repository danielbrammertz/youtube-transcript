#!/usr/bin/env node

const { HttpsProxyAgent } = require('https-proxy-agent');

async function checkProxy() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let proxyUrl = null;
  
  // Check for --proxy argument
  const proxyIndex = args.indexOf('--proxy');
  if (proxyIndex !== -1 && args.length > proxyIndex + 1) {
    proxyUrl = args[proxyIndex + 1];
  }
  
  try {
    console.log('Checking your IP address...');
    
    // Import fetch (ESM module)
    const nodeFetch = await import('node-fetch');
    const fetch = nodeFetch.default;
    
    // Make request without proxy first
    console.log('Direct connection:');
    try {
      const directResponse = await fetch('https://checkip.amazonaws.com', {
        timeout: 10000 // 10 second timeout
      });
      const directIp = await directResponse.text();
      console.log(`Your direct IP: ${directIp.trim()}`);
    } catch (directError) {
      console.error('Failed to get direct IP:', directError.message);
    }
    
    // If proxy URL is provided, make a request through the proxy
    if (proxyUrl) {
      console.log(`\nUsing proxy: ${proxyUrl}`);
      try {
        // Create proxy agent
        const proxyAgent = new HttpsProxyAgent(proxyUrl);
        
        // Make request through proxy
        const proxyResponse = await fetch('https://checkip.amazonaws.com', {
          agent: proxyAgent,
          timeout: 10000 // 10 second timeout
        });
        const proxyIp = await proxyResponse.text();
        console.log(`Your IP through proxy: ${proxyIp.trim()}`);
        
        // Compare IPs to verify proxy is working
        if (directIp && proxyIp && directIp.trim() !== proxyIp.trim()) {
          console.log('✅ Proxy is working correctly! The IPs are different.');
        } else if (directIp && proxyIp && directIp.trim() === proxyIp.trim()) {
          console.log('❌ Proxy is NOT working! The IPs are the same.');
        }
      } catch (proxyError) {
        console.error('Failed to connect through proxy:', proxyError.message);
        console.log('❌ Proxy connection failed. Check if the proxy URL is correct and the proxy is running.');
      }
    } else {
      console.log('\nNo proxy URL provided. Use --proxy <url> to test with a proxy.');
      console.log('Example: node check-proxy.js --proxy http://192.168.178.2:8118');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProxy(); 