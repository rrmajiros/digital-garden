const Parser = require('rss-parser');
const axios = require('axios');

const FEED_URLS = {
    villaVie: process.env.VILLA_VIE_FEED,
    residentialCruising: process.env.RESIDENTIAL_CRUISING_FEED
};

// Use the exact Channel ID for Villa Vie Residences
const YOUTUBE_RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1BQVhFTEJfSnNGQW1vcVJ4';

const parser = new Parser({
    customFields: {
        item: [
            ['yt:videoId', 'videoId']
        ]
    }
});

module.exports = async (req, res) => {
    try {
        const feedsData = {};
        let youtubeData = [];

        // --- Fetch RSS Feeds ---
        const fetchPromises = Object.keys(FEED_URLS).map(async (key) => {
            const url = FEED_URLS[key];
            if (!url) return { key, items: [] };
            try {
                const feed = await parser.parseURL(url);
                return { key, items: feed.items };
            } catch (urlError) {
                return { key, items: [] };
            }
        });

        const results = await Promise.all(fetchPromises);
        feedsData.villaVie = results.find(r => r.key === 'villaVie')?.items || [];
        feedsData.residentialCruising = results.find(r => r.key === 'residentialCruising')?.items || [];

        // --- Fetch YouTube Videos (RSS Method) ---
        try {
            console.log('Fetching YouTube RSS:', YOUTUBE_RSS_URL);
            const ytFeed = await parser.parseURL(YOUTUBE_RSS_URL);
            console.log('YouTube items found:', ytFeed.items.length);
            
            youtubeData = ytFeed.items.map(item => {
                const videoId = item.videoId || item.id.split(':').pop();
                return {
                    id: { videoId },
                    snippet: {
                        title: item.title,
                        channelTitle: 'Villa Vie Residences',
                        thumbnails: {
                            high: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }
                        }
                    }
                };
            }).slice(0, 6);
        } catch (ytError) {
            console.error('Error fetching YouTube RSS:', ytError.message);
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).json({ feeds: feedsData, youtube: youtubeData });

    } catch (error) {
        console.error('Main error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
