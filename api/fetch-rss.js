const Parser = require('rss-parser');

// This code pulls the URLs from Vercel's environment variables
const FEED_URLS = [
    process.env.VILLA_VIE_FEED,
    process.env.RESIDENTIAL_CRUISING_FEED
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
            try {
                const feed = await parser.parseURL(url);
                allEntries.push(...feed.items);
            } catch (urlError) {
                // Log a specific error for the URL that failed
                console.error(`Error parsing or fetching URL: ${url}`, urlError);
                // Continue to the next URL instead of crashing
            }
        }

        // Check if we successfully fetched any entries at all
        if (allEntries.length === 0) {
            // This happens if both feeds failed
            console.error('All feeds failed to load.');
            return res.status(500).json({ error: 'All feeds failed to load.' });
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
        console.error('Error in main try-catch block:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feeds.' });
    }
};
