const Parser = require('rss-parser');

// Your two RSS feed URLs.
const FEED_URLS = [
    process.env.VILLA_VIE_FEED,
    // process.env.RESIDENTIAL_CRUISING_FEED // Commented out to test the first feed
];

const parser = new Parser();

module.exports = async (req, res) => {
    try {
        const allEntries = [];

        // Check if environment variables are set
        if (!process.env.VILLA_VIE_FEED || !process.env.RESIDENTIAL_CRUISING_FEED) {
            console.error('Environment variables for feeds are not set.');
            return res.status(500).json({ error: 'Feed URLs are not configured.' });
        }

        for (const url of FEED_URLS) {
            const feed = await parser.parseURL(url);
            allEntries.push(...feed.items);
        }

        allEntries.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

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

        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(combinedFeedXML);

    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feeds.' });
    }
};
