const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); 
app.use(express.json());

app.post('/convert', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).send('No URL provided');
    }

    // Extract the video ID from the full link
    let videoId = "";
    try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v") || urlObj.pathname.split('/').pop();
    } catch(e) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        // Fetch the key safely from Render's hidden environment variables
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY, 
                'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
            }
        };

        let conversionStatus = "processing";
        let data;
        
        // Dynamic importing node-fetch if needed, or using built-in fetch if Node version is 18+
        // Render uses modern Node by default, so global fetch works perfectly!
        while (conversionStatus === "processing") {
            const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
            const response = await fetch(apiUrl, options);
            data = await response.json();
            
            conversionStatus = data.status;
            
            if (conversionStatus === "processing") {
                // Wait 2 seconds before polling the third-party API again
                await new Promise(resolve => setTimeout(resolve, 2000)); 
            }
        }
        
        if (conversionStatus === "ok" && data.link) {
            // Send the final download link back to the frontend safely
            res.json({ success: true, downloadUrl: data.link });
        } else {
            res.status(500).json({ success: false, message: data.msg || "Conversion failed" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
