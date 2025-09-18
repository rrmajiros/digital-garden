const Airtable = require('airtable');
const { marked } = require('marked');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content']
        }).firstPage();

        const notes = records.map(record => {
            const rawContent = record.get('Content');
            
            // Log the raw data here for debugging
            console.log('--- RAW AIRTABLE CONTENT START ---');
            console.log(JSON.stringify(rawContent, null, 2));
            console.log('--- RAW AIRTABLE CONTENT END ---');
            
            // For now, we are just sending the raw data to the client
            return {
                id: record.id,
                title: record.get('Title'),
                content: rawContent
            };
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
