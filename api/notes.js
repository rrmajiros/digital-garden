const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            // Add 'Status' to the list of fields to fetch
            fields: ['Title', 'Content', 'Status']
        }).firstPage();

        const notes = records.map(record => {
            return {
                id: record.id,
                title: record.get('Title'),
                content: record.get('Content'),
                // Map the Status field to the new object
                status: record.get('Status') 
            };
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
