const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

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
        console.log("Starting anti-bot audio download...");
        
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            format: 'bestaudio', 
            ffmpegLocation: ffmpegPath, 
            output: filePath,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'referer:youtube.com', 
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        console.log("Conversion complete! Sending file...");
        res.download(filePath, 'ConvertedAudio.mp3', (err) => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
            }
        });
    } catch (error) {
        console.error("ERROR DURING CONVERSION:", error);
        res.status(500).send('Conversion failed.');
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
