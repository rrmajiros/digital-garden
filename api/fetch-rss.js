// api/fetch-rss.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const feedUrl = 'https://www.google.com/alerts/feeds/18371521636352342425/13062188680277248882';
    
    // Fetch the external RSS feed on the server side
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const feedXml = await response.text();
    
    // Set headers to allow client-side access and correctly identify the content type
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all domains to access this proxy
    
    res.status(200).send(feedXml);
    
  } catch (error) {
    console.error('Error in RSS proxy:', error);
    res.status(500).send('Failed to retrieve feed.');
  }
}
