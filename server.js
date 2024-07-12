const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;
let currentController = null;
let requestCount = 0; // Counter for requests

app.use(cors());
app.use(bodyParser.json());

// Load data from JSON
const data = JSON.parse(fs.readFileSync('data.json'));

app.post('/submit', (req, res) => {
    requestCount++; // Increment request counter

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`Request ${requestCount} received: ${email}`);

    // Abort the previous request if there is one
    if (currentController) {
        currentController.abort();
        console.log(`Request ${requestCount - 1} aborted`);
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    currentController = controller;
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        const entry = data.find(item => item.email === email);

        if (entry) {
            res.json({ exists: true, data: entry });
        } else {
            res.json({ exists: false });
        }
        
        console.log(`Request ${requestCount} completed or timed out`);
        currentController = null; // Clear controller after completion
    }, 5000); // 5-second delay

    signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        res.status(499).json({ error: 'Request aborted' });
        console.log(`Request ${requestCount} aborted (listener)`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
