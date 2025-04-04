# Product Requirements Document (PRD): S&P 500 Tracking Web App

## 1. Introduction
This PRD outlines the requirements for a web application that tracks the S&P 500 index price based on U.S. presidential terms. The app will feature an interactive graph comparing the S&P 500 performance during the current and former president's terms, with options to explore historical data. It will fetch data from a public API, store it in JSON files, and update it daily using a cron job.

## 2. Objectives
- Deliver a clear, interactive visualization of S&P 500 performance across different U.S. presidential terms.
- Highlight key metrics, such as percentage change and price change, for each president's term.
- Create an intuitive user experience centered around the graph as the primary interface.
- Automate daily data updates to ensure the information remains current.

## 3. Key Features

### Interactive Graph:
- A line graph showing S&P 500 closing prices over time.
- Default view: Comparison of the current and former president's terms.
- Includes tooltips, zoom, pan, a dropdown for selecting other presidents or time periods, and a reset button.

### Metrics Highlighting:
- Display percentage change and price change for each president's term.
- Presented via tooltips or a summary section.

### Data Storage:
- Store historical S&P 500 data in a JSON file.
- Store presidential historical data (including start, end dates, and current status) in a separate JSON file.
- Update the S&P 500 data daily with a cron job fetching the latest closing price.

### User Experience:
- Offer a clean, responsive design with the graph as the central focus.
- Provide brief instructions for interacting with the graph.

## 4. Data Sources

### 4.1 S&P 500 Price Data
**Source:** Yahoo Finance API (symbol: ^GSPC).

**Fetch Method:**
- Perform a one-time fetch for historical data (up to 100 years, if available).
- Schedule daily updates via a cron job for the latest closing price.
- Data Points: Daily closing prices.

### 4.2 Presidential Terms
**Source:** A static list of U.S. presidents and their terms.

**Format:** A separate JSON file containing each president's name, start date, end date, and a boolean indicating if they are the current president.

**Example Structure:**
```json
[
  {
    "name": "Herbert Hoover",
    "start": "1929-03-04",
    "end": "1933-03-04",
    "isCurrent": false
  },
  {
    "name": "Franklin D. Roosevelt",
    "start": "1933-03-04",
    "end": "1945-04-12",
    "isCurrent": false
  },
  ...
  {
    "name": "Joe Biden",
    "start": "2021-01-20",
    "end": "2025-01-20",
    "isCurrent": true
  }
]
```

**Scope:** Covers the earliest available S&P 500 data (e.g., 1925) to the present.

## 5. Functional Requirements

### 5.1 Data Fetching and Storage
**Initial Data Fetch:**
- Retrieve historical S&P 500 data from the Yahoo Finance API.
- Save the data in a JSON file (sp500_data.json) with the following structure:
```json
[
  { "date": "1925-01-01", "close": 12.34 },
  { "date": "1925-01-02", "close": 12.36 },
  ...
]
```

**Daily Updates:**
- Use a cron job to fetch the latest closing price daily and append it to sp500_data.json.
- Include error handling for API downtime (e.g., retry logic).

### 5.2 Presidential Terms Data
**Static JSON File:**
- Create a separate JSON file (presidents.json) containing each president's name, start date, end date, and a boolean (isCurrent) indicating if they are the current president.

**Maintenance:**
- Manually update the file when a new president is inaugurated or when the current president's term ends.

### 5.3 Presidential Terms Mapping
**Term Definition:**
- Each term begins on the inauguration day and ends the day before the next president's inauguration.

**Data Mapping:**
- Use the presidents.json file to filter S&P 500 data by each president's term.
- Calculate the percentage change and price change for each term.

### 5.4 Frontend
**Framework:** React.

**Graph Library:** Chart.js.

**Graph Features:**
- Line graph with number of days after inauguration on the X-axis and price percentage variation instead of closing prices on the Y-axis.
- Default view: Current and former president's terms in distinct colors.
- Tooltips displaying date, closing price, percentage change, and price change.
- Dropdown to select other presidents or custom date ranges.
- Zoom, pan, and reset functionality.

### 5.5 Backend
**Framework:** Node.js with Express.

**API Endpoints:**
- Serve S&P 500 data via /api/sp500.
- Serve presidential data via /api/presidents.

**Cron Job:** A Node.js script to fetch and append the latest S&P 500 price daily.

## 6. Non-Functional Requirements
**Performance:**
- Optimize data loading for fast graph rendering.
- Efficiently handle large datasets (e.g., implement lazy loading if needed).

**Reliability:**
- Ensure daily updates are consistent, with retry logic for API failures.

**User Interface:**
- Provide a clean, intuitive design prioritizing the graph.
- Ensure a responsive layout for desktop and tablet devices.

## 7. Edge Cases and Error Handling
- API Downtime: Implement retry logic (e.g., 3 attempts with delays) for data fetching.
- Data Gaps: Address weekends, holidays, or missing data by using the last available closing price.
- Presidential Anomalies: Adjust term end dates for mid-term transitions (e.g., deaths, resignations).

## 8. Implementation Plan
1. Select and Test API:
   - Validate the Yahoo Finance API for S&P 500 data retrieval.

2. Fetch Historical Data:
   - Retrieve up to 100 years of data and save it to sp500_data.json.

3. Create Presidential Data File:
   - Compile a static list of presidents with their terms and save it to presidents.json.

4. Map Data to Terms:
   - Use presidents.json to filter S&P 500 data and compute metrics.

5. Build Frontend:
   - Set up React and integrate Chart.js.
   - Develop the interactive graph with all specified features.

6. Set Up Backend:
   - Configure Node.js and Express to serve both JSON files.

7. Automate Daily Updates:
   - Implement and schedule the cron job for daily data updates.

8. Test:
   - Confirm graph accuracy, metric calculations, and daily update reliability.

## 9. Future Considerations (Excluded for Now)
- Data export functionality (e.g., CSV).
- User authentication or personalization features.
- Support for additional indices (e.g., NASDAQ).

## 10. Conclusion
This PRD provides a detailed roadmap for developing an interactive web application to visualize S&P 500 performance across U.S. presidential terms. By utilizing the Yahoo Finance API for data, React and Chart.js for the frontend, and Node.js for the backend, the app will offer a reliable and engaging user experience. Emphasizing percentage and price changes with a clean design will enable users to easily explore historical trends and comparisons.

## 11. Presidential Performance Summary
To enrich the app's insights beyond the interactive graph, a summary table will be included to provide users with a detailed comparison of U.S. presidents based on the S&P 500 performance during their terms. This table will rank presidents by the percentage change in the S&P 500, offering a quick reference for identifying which presidents oversaw the largest gains or losses, along with other relevant data points.

### Purpose of the Table
The table complements the app's primary visualization by:
- Highlighting the top and bottom performers in S&P 500 growth.
- Providing a ranked overview of all presidents based on performance.
- Offering key data in an easily digestible format for users who want a snapshot without interacting with the graph.

### Table Structure
The table will include the following columns:
- President: The name of the president.
- Term Start: The start date of the presidential term.
- Term End: The end date of the presidential term.
- S&P 500 Start: The S&P 500 closing price on the term start date.
- S&P 500 End: The S&P 500 closing price on the term end date.
- % Change: The percentage change in the S&P 500 from the start to the end of the term.
- Rank: The ranking of the president based on % Change, with 1 being the highest percentage increase.

The table will be sorted by the % Change column in descending order, placing the president with the highest S&P 500 growth at the top.

### Highlighted Sections
To draw attention to extreme performers, the table will include:
- Top Performers: The three presidents with the highest % Change in the S&P 500.
- Bottom Performers: The three presidents with the lowest % Change (including negative values, if applicable).

These highlights will allow users to quickly see the best and worst-performing presidential terms.

### Data Source
The table will use the same S&P 500 and presidential term data as the interactive graph, stored in JSON files. The % Change and rankings will be calculated dynamically, ensuring the table reflects the most current data available.

### Presentation in the App
The table will be accessible in a dedicated section or tab, separate from the graph, to maintain the app's focus on visualization while offering this additional insight.

Users may toggle the table's visibility or sort it by different columns (e.g., president name or term start date) for flexibility.

### Example Table (Hypothetical Data)
Below is a sample of how the table might look with placeholder data:

| President | Term Start | Term End | S&P 500 Start | S&P 500 End | % Change | Rank |
|-----------|------------|----------|---------------|-------------|----------|------|
| Bill Clinton | 1993-01-20 | 2001-01-20 | 435.23 | 1342.54 | 208.5% | 1 |
| Barack Obama | 2009-01-20 | 2017-01-20 | 805.22 | 2271.72 | 182.1% | 2 |
| Ronald Reagan | 1981-01-20 | 1989-01-20 | 129.55 | 277.72 | 114.3% | 3 |
| ... | ... | ... | ... | ... | ... | ... |
| Herbert Hoover | 1929-03-04 | 1933-03-04 | 24.35 | 5.53 | -77.3% | 45 |

#### Top Performers:
- Bill Clinton: 208.5%
- Barack Obama: 182.1%
- Ronald Reagan: 114.3%

#### Bottom Performers:
- Herbert Hoover: -77.3%

### Implementation Notes
The table will be generated on the backend using existing data, with calculations for % Change and rankings performed efficiently to ensure quick rendering.

It will scale to accommodate all presidential terms and update automatically with new data (e.g., after a new president's term ends).