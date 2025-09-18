const Parser = require('rss-parser');

const FEED_URLS = [
    process.env.VILLA_VIE_FEED,
    process.env.RESIDENTIAL_CRUISING_FEED
];

const parser = new Parser();

module.exports = async (req, res) => {
    try {
        const allEntries = [];

        if (!process.env.VILLA_VIE_FEED || !process.env.RESIDENTIAL_CRUISING_FEED) {
            console.error('Environment variables for feeds are not set.');
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send('<error>Feed URLs are not configured.</error>');
            return;
        }

        for (const url of FEED_URLS) {
            try {
                const feed = await parser.parseURL(url);
                allEntries.push(...feed.items);
            } catch (urlError) {
                console.error(`Error parsing or fetching URL: ${url}`, urlError);
            }
        }

        if (allEntries.length === 0) {
            console.error('All feeds failed to load.');
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send('<error>All feeds failed to load.</error>');
            return;
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

        // Log the final XML before sending it to the client
        console.log('Final XML to be sent:', combinedFeedXML);

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).send(combinedFeedXML);

    } catch (error) {
        console.error('Error in main try-catch block:', error);
        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send('<error>Failed to fetch RSS feeds due to a server error.</error>');
    }
};
