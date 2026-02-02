const Parser = require('rss-parser');
const axios = require('axios');

const FEED_URLS = {
    villaVie: process.env.VILLA_VIE_FEED,
    residentialCruising: process.env.RESIDENTIAL_CRUISING_FEED
};

module.exports = async (req, res) => {
    try {
        const feedsData = {};
        let youtubeData = [];

        // --- Fetch RSS Feeds ---
        const fetchPromises = Object.keys(FEED_URLS).map(async (key) => {
            const url = FEED_URLS[key];
            if (!url) return { key, items: [] };
            try {
                const parser = new Parser();
                const feed = await parser.parseURL(url);
                return { key, items: feed.items };
            } catch (urlError) {
                return { key, items: [] };
            }
        });

        const results = await Promise.all(fetchPromises);
        feedsData.villaVie = results.find(r => r.key === 'villaVie')?.items || [];
        feedsData.residentialCruising = results.find(r => r.key === 'residentialCruising')?.items || [];

        // --- Fetch YouTube Videos (Search Method - Secure Server-Side) ---
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        
        if (YOUTUBE_API_KEY) {
            try {
                // Search for the latest "Villa Vie Odyssey" videos from any creator
                const searchTerms = 'Villa Vie Odyssey';
                const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerms)}&type=video&maxResults=6&order=date&key=${YOUTUBE_API_KEY}`;
                
                const youtubeResponse = await axios.get(youtubeSearchUrl);
                youtubeData = youtubeResponse.data.items;
            } catch (youtubeError) {
                console.error('Error fetching YouTube search results:', youtubeError.response?.data?.error?.message || youtubeError.message);
            }
        } else {
            console.error('YouTube API key is missing in server environment.');
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).json({ feeds: feedsData, youtube: youtubeData });

    } catch (error) {
        console.error('Main error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
