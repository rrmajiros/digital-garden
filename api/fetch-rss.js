const Parser = require('rss-parser');

const FEED_URLS = {
    villaVie: process.env.VILLA_VIE_FEED,
    residentialCruising: process.env.RESIDENTIAL_CRUISING_FEED
};

const parser = new Parser();

module.exports = async (req, res) => {
    try {
        const feedsData = {};

        if (!FEED_URLS.villaVie || !FEED_URLS.residentialCruising) {
            console.error('Environment variables for feeds are not set.');
            return res.status(500).json({ error: 'Feed URLs are not configured.' });
        }

        const fetchPromises = Object.keys(FEED_URLS).map(async (key) => {
            const url = FEED_URLS[key];
            try {
                const feed = await parser.parseURL(url);
                return { key, items: feed.items };
            } catch (urlError) {
                console.error(`Error parsing or fetching URL for key: ${key}`, urlError);
                return { key, items: [] };
            }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(result => {
            if (result.items.length > 0) {
                feedsData[result.key] = result.items;
            }
        });

        if (Object.keys(feedsData).length === 0) {
            console.error('All feeds failed to load.');
            return res.status(500).json({ error: 'All feeds failed to load.' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).json(feedsData);

    } catch (error) {
        console.error('Error in main try-catch block:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feeds due to a server error.' });
    }
};
