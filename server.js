// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // To load environment variables from a .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors());

// Replace with your sheet ID
const sheetId = '1QqxjcZj8YZWHNri6quC3Cu3uUo9pWrlP9P73k3oKUAM';

// Route to fetch data from Google Sheets based on date range and selected filters
app.get('/fetch-data', async (req, res) => {
  const { fromDate, toDate, selectedDepartments, selectedWorkingRegions } = req.query;

  try {
    const apiKey = process.env.GOOGLE_SHEET_API_KEY; // Your Google API key stored in environment variables
    const range = 'A:Z';

    const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
    const data = response.data;
    const headers = data.values[0];
    const rows = data.values.slice(1);

    let filteredRows = [];

    // Filter rows based on the provided dates and selected departments/working regions
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

    // Send filtered rows back to the frontend
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
