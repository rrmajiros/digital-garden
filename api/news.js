const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        // Only fetch records with Status = 'Done' (Airtable-side "Published")
        const records = await base('OdysseyNews').select({
            view: 'Grid view',
            filterByFormula: "{Status} = 'Done'",
            sort: [{ field: 'Published', direction: 'desc' }]
        }).firstPage();

        const news = records.map(record => {
            const attachments = record.get('Image') || [];
            const imageUrl = attachments.length > 0 ? attachments[0].url : record.get('ImageURL');
            
            return {
                id: record.id,
                title: record.get('Title'),
                content: record.get('Content'),
                link: record.get('Link'),
                image: imageUrl,
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
