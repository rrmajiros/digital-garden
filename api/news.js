const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('OdysseyNews').select({
            view: 'Grid view',
            sort: [{ field: 'Published', direction: 'desc' }]
        }).firstPage();

        const news = records.map(record => {
            return {
                id: record.id,
                title: record.get('Title'),
                content: record.get('Content'),
                link: record.get('Link'),
                image: record.get('ImageURL'),
                published: record.get('Published'),
                status: record.get('Status')
            };
        });

        res.status(200).json(news);
    } catch (error) {
        console.error('Error in api/news.js:', error);
        res.status(500).json({ error: 'Failed to fetch news.' });
    }
};
