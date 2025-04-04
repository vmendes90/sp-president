# Todo List: Building the S&P 500 Tracking Web App

This todo list outlines the steps to create a web application that tracks S&P 500 performance with interactive features, such as a graph showing historical data and presidential terms. Follow these steps sequentially for a structured approach.

## 1. Data Fetching and Storage

### Select and Test the API
- Research and choose the Yahoo Finance API to retrieve S&P 500 data.
- Test the API to confirm it provides historical data (up to 100 years if possible).
- Document any limitations, such as rate limits or data availability.

### Fetch Historical S&P 500 Data
- Write a script to pull historical S&P 500 closing prices from Yahoo Finance.
- Save the data in a JSON file named sp500_data.json with this format:
```json
[
  { "date": "YYYY-MM-DD", "close": 1234.56 },
  ...
]
```
- Optimize the script to handle large datasets efficiently.

### Create Presidential Data File
- Compile a list of U.S. presidents from 1925 to today, including their names, start dates, end dates, and a flag for the current president.
- Save this in a JSON file named presidents.json with this structure:
```json
[
  {
    "name": "President Name",
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD",
    "isCurrent": false
  },
  ...
]
```
- Manually update the file to reflect the current president.

## 2. Backend Setup

### Set Up Node.js and Express
- Initialize a new Node.js project with npm init.
- Install Express and any required middleware (e.g., npm install express).
- Create a basic server to handle static files and API requests.

### Create API Endpoints
- Build an endpoint /api/sp500 to serve data from sp500_data.json.
- Build an endpoint /api/presidents to serve data from presidents.json.
- Add error handling to manage large datasets or file access issues.

### Implement Daily Data Updates
- Write a script to fetch the latest S&P 500 closing price daily from Yahoo Finance.
- Append this data to sp500_data.json.
- Set up a cron job to run the script daily (e.g., at midnight).
- Include error handling and logging for the cron job.

## 3. Frontend Development

### Set Up React
- Create a new React project using npx create-react-app.
- Install dependencies like Chart.js for graphing (e.g., npm install chart.js react-chartjs-2).

### Design the User Interface
- Design a responsive layout with the graph as the main focus.
- Add a short explanation of the graph and usage instructions.
- Optimize primarily for desktop and tablet, while ensuring mobile compatibility.

### Fetch and Display Data
- Use Axios or the Fetch API to get data from /api/sp500 and /api/presidents.
- Store the data in React state or context for easy access across components.

### Implement the Interactive Graph
- Use Chart.js to create a line graph with dates (X-axis) and closing prices (Y-axis).
- Set the default view to show the current and former president's terms in different colors.
- Add vertical lines to mark presidential transitions.
- Include tooltips showing date, closing price, percentage change, and price change.
- Add zoom, pan, and reset buttons for navigation.
- Create a dropdown to select other presidents or custom date ranges.

### Calculate and Display Metrics
- Write functions to compute percentage change and price change for each president's term.
- Show these metrics in tooltips or a summary section near the graph.

## 4. Testing and Deployment

### Test Data Fetching and Updates
- Confirm historical data is fetched and stored correctly.
- Test the cron job to ensure daily updates run smoothly.
- Simulate API failures to verify error handling.

### Test the Graph and Interactions
- Check that the graph displays correctly with the default view.
- Test tooltips, zoom, pan, reset, and dropdown functionality.
- Verify that metrics are calculated and displayed accurately.

### Test Edge Cases
- Test behavior with data gaps (e.g., weekends or holidays).
- Validate mid-term presidential changes to ensure term dates adjust properly.
- Check performance with large datasets.

### Prepare for Deployment
- Optimize the app for production (e.g., minify files, enable caching).
- Deploy to a hosting platform like Heroku or AWS.
- Configure the cron job on the server for daily updates.

## 5. Documentation and Maintenance

### Document the Code
- Add comments to key sections of the code for clarity.
- Write a README.md file with setup instructions and a project overview.

### Plan for Future Updates
- Note when manual updates to presidents.json are needed (e.g., after elections).
- Set reminders to keep presidential data current.
