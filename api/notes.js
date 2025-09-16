// api/notes.js
import Airtable from 'airtable';

// Initialize Airtable with secrets from Vercel environment variables
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  try {
    const records = await base('Notes').select({
      // Your view name here. Make sure to create a view that only contains the fields you want to display.
      view: "Grid view", 
      // Maximum number of records to return
      pageSize: 10
    }).all();

    const formattedRecords = records.map(record => ({
      id: record.id,
      title: record.get('Title'),
      content: record.get('Content'),
      status: record.get('Status')
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
