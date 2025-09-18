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
        
        const villaVieItems = results.find(r => r.key === 'villaVie')?.items || [];
        const residentialCruisingItems = results.find(r => r.key === 'residentialCruising')?.items || [];

        // Create a set of existing Villa Vie links to prevent duplicates
        const villaVieLinks = new Set(villaVieItems.map(item => item.link));

        // Filter Residential Cruising items for Villa Vie content
        const filteredCruisingItems = residentialCruisingItems.filter(item => {
            const isRelevant = (item.title && item.title.includes('Villa Vie')) || 
                                (item.contentSnippet && item.contentSnippet.includes('Villa Vie'));
            const isDuplicate = villaVieLinks.has(item.link);
            return isRelevant && !isDuplicate;
        });

        // Combine and sort the Villa Vie items
        const combinedVillaVieItems = [...villaVieItems, ...filteredCruisingItems];
        combinedVillaVieItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        feedsData.villaVie = combinedVillaVieItems;
        feedsData.residentialCruising = residentialCruisingItems;

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
