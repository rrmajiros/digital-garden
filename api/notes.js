const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

function convertAirtableRichTextToHtml(richTextData) {
    if (!richTextData) {
        return '';
    }

    if (typeof richTextData === 'string') {
        return richTextData.replace(/\n/g, '<br>');
    }

    if (Array.isArray(richTextData)) {
        let html = '';
        let inList = false;

        richTextData.forEach(block => {
            const blockType = block.type;
            let text = block.text || '';

            if (block.attributes) {
                if (block.attributes.bold) {
                    text = `<strong>${text}</strong>`;
                }
                if (block.attributes.italic) {
                    text = `<em>${text}</em>`;
                }
            }

            switch (blockType) {
                case 'richText.paragraph':
                    if (inList) {
                        html += '</ul>';
                        inList = false;
                    }
                    html += `<p>${text}</p>`;
                    break;
                case 'richText.heading':
                    if (inList) {
                        html += '</ul>';
                        inList = false;
                    }
                    const headingLevel = block.attributes.level || 1;
                    html += `<h${headingLevel}>${text}</h${headingLevel}>`;
                    break;
                case 'richText.list_item':
                    if (!inList) {
                        html += '<ul>';
                        inList = true;
                    }
                    html += `<li>${text}</li>`;
                    break;
                default:
                    if (inList) {
                        html += '</ul>';
                        inList = false;
                    }
                    html += text;
            }
        });

        if (inList) {
            html += '</ul>';
        }

        return html;
    }

    return '';
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
