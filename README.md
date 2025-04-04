# S&P 500 Presidential Tracker

This web application tracks the S&P 500 index price based on U.S. presidential terms. It features an interactive graph comparing the S&P 500 performance during different presidents' terms, with options to explore historical data.

## Features

- Interactive graph showing S&P 500 closing prices over time
- Default view: Comparison of the current and former president's terms
- Includes tooltips, zoom, pan, and reset functionality
- Dropdown menus for selecting presidents to compare
- Metrics highlighting percentage change and price change for each president's term
- Automated daily updates of S&P 500 data

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework with server-side rendering
- [Chart.js](https://www.chartjs.org/) - Flexible JavaScript charting library
- [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom) - Zoom and pan plugin for Chart.js
- [Yahoo Finance API](https://github.com/gadicc/node-yahoo-finance2) - For fetching S&P 500 data
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [tRPC](https://trpc.io/) - End-to-end typesafe API layer

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/sp-president.git
   cd sp-president
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your own values, particularly:
   - `CRON_SECRET`: A secure random string for authenticating the cron job

### Development

Run the development server:
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```
npm run build
npm run start
```

## Data Management

### Initial Data Setup

When you first run the application, you'll need to initialize the S&P 500 data:

1. Navigate to the application in your browser
2. In the "Data Management" section, click "Fetch All Historical Data"
3. Wait for the data to be fetched (this may take a moment)

### Setting Up Daily Updates

The application includes an API endpoint (`/api/cron`) that can be triggered to update the S&P 500 data with the latest closing price. You can set up a cron job or scheduled task to call this endpoint daily after market close.

#### Option 1: Using a cron job service (recommended for production)

Use a service like [Uptime Robot](https://uptimerobot.com/), [Cronitor](https://cronitor.io/), or [GitHub Actions](https://github.com/features/actions) to set up a daily API call:

```
curl -X GET https://your-app-url.com/api/cron -H "Authorization: Bearer your-cron-secret"
```

Make sure to replace `your-app-url.com` with your actual domain and `your-cron-secret` with the value of `CRON_SECRET` in your environment variables.

#### Option 2: Using a local cron job (for development)

On Unix-based systems (Linux, macOS), you can use the `crontab` to schedule the update:

1. Open the crontab editor:
   ```
   crontab -e
   ```

2. Add a line to run the curl command daily at 6:00 PM (after market close):
   ```
   0 18 * * 1-5 curl -X GET http://localhost:3000/api/cron -H "Authorization: Bearer your-cron-secret"
   ```

On Windows, you can use the Task Scheduler to create a similar scheduled task.

## Maintenance

- Check the S&P 500 data regularly to ensure it's being updated correctly
- Update the `presidents.json` file when a new president is inaugurated or when the current president's term ends

## License

This project is licensed under the MIT License - see the LICENSE file for details
