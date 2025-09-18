const Airtable = require('airtable');
const { marked } = require('marked');

// Make sure your Airtable credentials are set up as environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        console.log('Attempting to fetch notes from Airtable...');

        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content'],
            cellFormat: 'markdown'
        }).firstPage();

        console.log(`Fetched ${records.length} records.`);

        const notes = records.map(record => {
            let content = record.get('Content');
            if (content) {
                content = marked.parse(content);
            }
            return {
                id: record.id,
                title: record.get('Title'),
                content: content
            };
        });

        console.log('Notes successfully processed. Sending to client.');
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
