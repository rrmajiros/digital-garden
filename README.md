Here is a draft of a README for your project, "Digital Compost." It covers the purpose of the site, its features, and the technical setup.

-----

## 🪴 Digital Compost

### Project Overview

Digital Compost is a personal website that serves as a centralized hub for notes, articles, and real-time updates from various web sources. The site combines personal markdown notes with external content from Google Alerts RSS feeds and YouTube videos, providing a single, curated view of information. The project is deployed on Vercel and uses serverless functions to fetch and process data, ensuring a fast and dynamic user experience.

### ✨ Features

  * **Markdown Notes**: Display personal notes and articles fetched from an Airtable base. Content is rendered in-browser using `marked.js`.
  * **Combined RSS Feeds**: Fetches and merges content from multiple Google Alerts RSS feeds. The logic filters content from one feed to enrich the other, and a robust client-side parser ensures reliable display.
  * **YouTube Integration**: Fetches the latest YouTube videos related to specific topics using the YouTube Data API.
  * **Responsive Design**: The site's layout is built with Tailwind CSS, ensuring it is fully responsive and looks great on both desktop and mobile devices.
  * **Serverless Architecture**: All external data fetching is handled by a Vercel serverless function, keeping the client-side code clean and secure.

### 🛠️ Technical Stack

  * **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
  * **Backend**: Vercel Serverless Functions (Node.js)
  * **APIs**:
      * **Airtable API**: For fetching personal notes.
      * **Google Alerts RSS Feeds**: For fetching news articles.
      * **YouTube Data API v3**: For fetching videos.
  * **Libraries**:
      * `rss-parser`: Parses RSS feed XML into a usable format.
      * `axios`: Makes HTTP requests to the YouTube API.
      * `marked.js`: Renders markdown content in the browser.

-----

### ⚙️ Setup Instructions

#### **1. Environment Variables**

This project requires several environment variables to function correctly. Go to your Vercel project settings and add the following:

  * `AIRTABLE_API_KEY`: Your API key for Airtable.
  * `AIRTABLE_BASE_ID`: The ID of your Airtable base.
  * `VILLA_VIE_FEED`: The URL for the Villa Vie Google Alerts RSS feed.
  * `RESIDENTIAL_CRUISING_FEED`: The URL for the Residential Cruising Google Alerts RSS feed.
  * `YOUTUBE_API_KEY`: Your API key for the YouTube Data API.

#### **2. Running Locally**

To run this project locally, you will need the Vercel CLI.

```bash
# Install Vercel CLI
npm install -g vercel

# Log in to your Vercel account
vercel login

# Start the development server
vercel dev
```

#### **3. Dependencies**

The project's serverless function relies on several npm packages. Make sure your `package.json` file includes these dependencies:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "rss-parser": "^3.12.0",
    "airtable": "^0.12.2"
  }
}
```
