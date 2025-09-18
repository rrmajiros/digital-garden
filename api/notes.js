const Airtable = require('airtable');

// Make sure your Airtable credentials are set up as environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

function convertAirtableRichTextToHtml(richTextData) {
    if (!richTextData) {
        return '';
    }
    
    // Check if the data is a simple string (e.g., from an old field type)
    if (typeof richTextData === 'string') {
        return richTextData.replace(/\n/g, '<br>');
    }

    // Process the new rich text format (array of blocks)
    if (Array.isArray(richTextData)) {
        let html = '';
        richTextData.forEach(block => {
            if (block.text) {
                let text = block.text;

                // Apply styles based on attributes
                if (block.attributes) {
                    if (block.attributes.bold) {
                        text = `<strong>${text}</strong>`;
                    }
                    if (block.attributes.italic) {
                        text = `<em>${text}</em>`;
                    }
                    // Handle other styles like underline, strikethrough etc. if needed
                }

                html += text;
            }

            // Add a paragraph break after each paragraph block
            if (block.type === 'richText.paragraph') {
                html += '<br>';
            }
        });
        return html;
    }
    
    // Return an empty string if the format is not recognized
    return '';
}

module.exports = async (req, res) => {
    try {
        console.log('Attempting to fetch notes from Airtable...');
        
        const records = await base('Notes').select({
            view: 'Grid view',
            fields: ['Title', 'Content']
        }).firstPage();

        console.log(`Fetched ${records.length} records.`);

        const notes = records.map(record => {
            const richTextContent = record.get('Content');
            const htmlContent = convertAirtableRichTextToHtml(richTextContent);

            return {
                id: record.id,
                title: record.get('Title'),
                content: htmlContent
            };
        });

        console.log('Notes successfully processed. Sending to client.');
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in api/notes.js:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
};
