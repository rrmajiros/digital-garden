const Parser = require('rss-parser');
const axios = require('axios');

const FEED_URLS = {
    villaVie: process.env.VILLA_VIE_FEED,
    residentialCruising: process.env.RESIDENTIAL_CRUISING_FEED
};

const parser = new Parser();

module.exports = async (req, res) => {
    try {
        const feedsData = {};
        const youtubeData = [];

        // --- Fetch RSS Feeds ---
        const fetchPromises = Object.keys(FEED_URLS).map(async (key) => {
            const url = FEED_URLS[key];
            if (!url) {
                console.error(`Environment variable for ${key} feed is not set.`);
                return { key, items: [] };
            }
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

        const villaVieLinks = new Set(villaVieItems.map(item => item.link));
        const filteredCruisingItems = residentialCruisingItems.filter(item => {
            const isRelevant = (item.title && item.title.includes('Villa Vie')) || 
                                (item.contentSnippet && item.contentSnippet.includes('Villa Vie'));
            const isDuplicate = villaVieLinks.has(item.link);
            return isRelevant && !isDuplicate;
        });

        const combinedVillaVieItems = [...villaVieItems, ...filteredCruisingItems];
        combinedVillaVieItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        feedsData.villaVie = combinedVillaVieItems;
        feedsData.residentialCruising = residentialCruisingItems;

        // --- Fetch YouTube Videos ---
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        console.log(`Checking for API Key. Found: ${!!YOUTUBE_API_KEY}`);
        
        const searchTerms = 'Villa Vie Residential Cruising';
        const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerms)}&type=video&maxResults=6&key=${YOUTUBE_API_KEY}`;
        
        console.log(`YouTube API URL: ${youtubeSearchUrl}`);
        
        if (YOUTUBE_API_KEY) {
            try {
                const youtubeResponse = await axios.get(youtubeSearchUrl);
                youtubeData.push(...youtubeResponse.data.items);
            } catch (youtubeError) {
                console.error('Error fetching YouTube videos:', youtubeError.response?.data?.error?.message || youtubeError.message);
                console.error('Full error object:', youtubeError.toJSON());
            }
        } else {
            console.error('YouTube API key is not set.');
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).json({ feeds: feedsData, youtube: youtubeData });

    } catch (error) {
        console.error('Error in main try-catch block:', error);
        res.status(500).json({ error: 'Failed to get content due to a server error.' });
    }
};
