const Airtable = require('airtable');

// Make sure your environment variables are set correctly in Vercel
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view'
        }).firstPage();

        const formattedRecords = records.map(record => {
            return {
                id: record.id,
                title: record.get('Title') || 'No Title',
                content: record.get('Content') || 'No content available.',
                tags: record.get('Tags') || [],
                created: record.get('Created')
            };
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(formattedRecords);
    } catch (error) {
        console.error('Airtable API error:', error);
        res.statusCode = 500;
        res.json({ error: 'Failed to fetch notes from Airtable.' });
    }
};
