const Parser = require('rss-parser');
const axios = require('axios');

const FEED_URLS = {
    villaVie: process.env.VILLA_VIE_FEED,
    residentialCruising: process.env.RESIDENTIAL_CRUISING_FEED
};

const YOUTUBE_RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXst3XCShZ1Ag7jGiQs-SfA';

const parser = new Parser({
    customFields: {
        item: [
            ['media:group', 'mediaGroup'],
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

        // --- Fetch YouTube Videos (RSS Method - Keyless) ---
        try {
            const ytFeed = await parser.parseURL(YOUTUBE_RSS_URL);
            youtubeData = ytFeed.items.map(item => {
                // Extract video ID and thumbnail from the RSS item
                const videoId = item.videoId || item.id.split(':').pop();
                const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                return {
                    id: { videoId },
                    snippet: {
                        title: item.title,
                        channelTitle: 'Villa Vie Residences',
                        thumbnails: {
                            high: { url: thumbnail }
                        }
                    }
                };
            }).slice(0, 6);
        } catch (ytError) {
            console.error('Error fetching YouTube RSS:', ytError);
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).json({ feeds: feedsData, youtube: youtubeData });

    } catch (error) {
        console.error('Error in main try-catch block:', error);
        res.status(500).json({ error: 'Failed to get content due to a server error.' });
    }
};
