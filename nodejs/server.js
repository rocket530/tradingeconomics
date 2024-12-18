const express = require('express');
const cors = require('cors');
const te = require('tradingeconomics'); // Trading Economics Node.js package
const bodyParser = require('body-parser');
const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

// API Key Configuration
const API_KEY = 'ca095e100f2a4e0:oc4cp2ds7nj9h7y'; // Replace with your actual key
te.login(API_KEY);



const groupByCountry = (array) => {
    return array.reduce((acc, item) => {
        const { Country } = item;

        // If this country doesn't exist in the accumulator, create an empty array
        if (!acc[Country]) {
            acc[Country] = [];
        }

        // Push the item into the country's array
        acc[Country].push(item);

        return acc;
    }, {});
};

// API Route: Fetch GDP Market Growth Data
app.get('/api/compare', async (req, res, next) => {
    try {
      const { countries, indicator } = req.query;
      //const data = await te.getForecasts(indicator = 'gdp',country ='mexico');
      const data = await te.getIndicatorData(country=countries);
      const groupedData = groupByCountry(data); 
      res.status(200).json(groupedData);
    } catch (error) {
       next (error); 
    }
});


// Get all countries
app.get('/api/countries', async (req, res, next) => {
    try {
        const countries = await te.getAllCountries();
        res.status(200).json(countries);
    } catch (error) {
        next(error); 
    }
});



// Error-handling Middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err.message);

    if (err.response && err.response.status) {
        const statusCode = err.response.status;

        switch (statusCode) {
            case 401:
                return res.status(401).json({ error: 'Unauthorized - Check your API Key' });
            case 403:
                return res.status(403).json({ error: 'Forbidden - Request limit reached or IP blocked' });
            case 400:
                return res.status(400).json({ error: 'Bad Request - Invalid parameters' });
            case 409:
                return res.status(409).json({ error: 'Conflict - Too many requests per second' });
            default:
                return res.status(statusCode).json({ error: `HTTP status ${statusCode}` });
        }
    }

    res.status(500).json({ error: 'Internal Server Error - An unexpected error occurred' });
});

// Start the backend server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
