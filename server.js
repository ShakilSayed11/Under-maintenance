// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from a .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors());

// Replace with your sheet ID
const sheetId = '1QqxjcZj8YZWHNri6quC3Cu3uUo9pWrlP9P73k3oKUAM';

// Route to fetch and process data from Google Sheets based on the frontend's input
app.get('/fetch-data', async (req, res) => {
  const { fromDate, toDate, selectedDepartments, selectedWorkingRegions } = req.query;

  try {
    const apiKey = process.env.GOOGLE_SHEET_API_KEY; // Your Google API key stored in environment variables
    const range = 'A:Z';

    // Fetch data from Google Sheets
    const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
    const data = response.data;
    const headers = data.values[0]; // Extract headers (first row)
    const rows = data.values.slice(1); // Extract rows (excluding headers)

    let filteredRows = [];

    // Process rows: filter based on date range, department, and region
    rows.forEach(row => {
      const taskDate = row[headers.indexOf('Task Date')];
      const workingDepartment = row[headers.indexOf('Working Department')];
      const workingRegion = row[headers.indexOf('Working Region')];

      if (
        new Date(taskDate) >= new Date(fromDate) &&
        new Date(taskDate) <= new Date(toDate) &&
        ((selectedDepartments.length === 0 || selectedDepartments.includes(workingDepartment)) &&
        (selectedWorkingRegions.length === 0 || selectedWorkingRegions.includes(workingRegion)))
      ) {
        filteredRows.push(row);
      }
    });

    // Send filtered rows and headers back to the frontend for further processing
    res.json({ headers, rows: filteredRows });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
