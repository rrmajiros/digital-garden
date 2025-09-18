const Airtable = require('airtable');
const { marked } = require('marked');

// This line will test if the 'marked' library is loaded
console.log('Is marked loaded?', !!marked);

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content']
        }).firstPage();

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

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
