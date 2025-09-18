const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content']
        }).firstPage();

        const notes = records.map(record => {
            const richTextContent = record.get('Content');
            
            // Log the raw data here for debugging
            console.log('--- RAW AIRTABLE CONTENT ---');
            console.log(JSON.stringify(richTextContent, null, 2));
            console.log('--- END RAW CONTENT ---');
            
            return {
                id: record.id,
                title: record.get('Title'),
                content: richTextContent // Sending the raw data for now
            };
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
