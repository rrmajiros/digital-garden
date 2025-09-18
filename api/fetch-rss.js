const Parser = require('rss-parser');

// Your two RSS feed URLs.
const FEED_URLS = [
    // This is the first feed for the "Villa Vie Odyssey"
    'https://www.google.com/alerts/feeds/18371521636352342425/559154728326149831',
    // This is the new feed for "Residential Cruising"
    'https://www.google.com/alerts/feeds/18371521636352342425/559154728326149831'
];

// Initialize the RSS parser
const parser = new Parser();

// Vercel serverless function
module.exports = async (req, res) => {
    try {
        const allEntries = [];

        // Fetch each feed and combine the entries
        for (const url of FEED_URLS) {
            const feed = await parser.parseURL(url);
            allEntries.push(...feed.items);
        }

        // Sort the entries by publication date
        allEntries.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Create a basic XML document to hold the combined entries
        let combinedFeedXML = '<?xml version="1.0" encoding="UTF-8"?>';
        combinedFeedXML += '<feed>';
        
        allEntries.forEach(entry => {
            combinedFeedXML += `<entry>
                <title>${entry.title}</title>
                <link href="${entry.link}"/>
                <summary>${entry.contentSnippet || entry.summary || 'No summary available.'}</summary>
            </entry>`;
        });
        
        combinedFeedXML += '</feed>';

        // Set the content type and send the response
        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(combinedFeedXML);

    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feeds.' });
    }
};
