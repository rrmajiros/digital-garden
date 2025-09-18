const Airtable = require('airtable');

// Make sure your Airtable credentials are set up as environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content'] // Make sure 'Content' is the name of your rich text field
        }).firstPage();

        const notes = records.map(record => {
            return {
                id: record.id,
                title: record.get('Title'),
                content: record.get('Content') // This gets the rich text content
            };
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
