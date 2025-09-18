function convertAirtableRichTextToHtml(richTextData) {
    if (!richTextData) {
        return '';
    }
    
    // Check if the data is a simple string
    if (typeof richTextData === 'string') {
        return richTextData.replace(/\n/g, '<br>');
    }

    // Process the new rich text format (array of blocks)
    if (Array.isArray(richTextData)) {
        let html = '';
        richTextData.forEach(block => {
            let text = block.text || '';

            // Apply styles based on attributes
            if (block.attributes) {
                if (block.attributes.bold) {
                    text = `<strong>${text}</strong>`;
                }
                if (block.attributes.italic) {
                    text = `<em>${text}</em>`;
                }
                // Check for bullet points. They are represented by a richText.list_item type.
                if (block.type === 'richText.list_item') {
                    text = `<li>${text}</li>`;
                }
            }
            
            // Handle block types
            if (block.type === 'richText.paragraph') {
                html += `<p>${text}</p>`;
            } else if (block.type === 'richText.heading') {
                // Determine the heading level and apply the correct tag
                const headingLevel = block.attributes.level || 1;
                html += `<h${headingLevel}>${text}</h${headingLevel}>`;
            } else if (block.type === 'richText.list') {
                // This wraps the list items
                html += `<ul>${text}</ul>`;
            } else if (block.type === 'richText.list_item') {
                html += text;
            } else {
                html += text;
            }
        });
        return html;
    }
    
    // Return an empty string if the format is not recognized
    return '';
}
