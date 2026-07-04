const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
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

    const fileName = `audio-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, fileName);
    
    try {
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: filePath
        });

        res.download(filePath, 'ConvertedAudio.mp3', (err) => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Conversion failed.');
    }
});

// Render provides a specific port automatically, so we tell the server to use it
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
