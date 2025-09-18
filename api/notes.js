const Airtable = require('airtable');

// Make sure your Airtable credentials are set up as environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

function convertAirtableRichTextToHtml(richTextData) {
    if (!richTextData || richTextData.length === 0) {
        return '';
    }

    let html = '';
    richTextData.forEach(block => {
        if (block.text) {
            let text = block.text;

            // Apply bolding
            if (block.attributes && block.attributes.bold) {
                text = `<strong>${text}</strong>`;
            }

            // Apply italics
            if (block.attributes && block.attributes.italic) {
                text = `<em>${text}</em>`;
            }

            html += text;
        }

        // Handle new lines
        if (block.type === 'richText.paragraph') {
            html += '<br>';
        }
    });

    return html;
}

module.exports = async (req, res) => {
    try {
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content']
        }).firstPage();

        const notes = records.map(record => {
            const richTextContent = record.get('Content');
            const htmlContent = convertAirtableRichTextToHtml(richTextContent);

            return {
                id: record.id,
                title: record.get('Title'),
                content: htmlContent
            };
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
