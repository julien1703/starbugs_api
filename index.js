require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const cors = require('cors');
const openai = require('openai');

const port = process.env.API_PORT || 3000;
const mongoCollection = process.env.MONGO_COLLECTION;
const mongoUri = process.env.MONGO_URI; 
const frontendUrl = process.env.FRONTEND_URL;
const OpenAiKey = process.env.OPEN_AI_API_KEY;

const openaiClient = new openai.OpenAI({
    apiKey: OpenAiKey,
});

const starSchema = new mongoose.Schema({
    proper: String,
    con: String,
    bay: String,
    flam: Number,
    mag: Number,
    ra: Number,
    dec: Number,
    x0: Number,
    y0: Number,
    z0: Number,
    color: String,
});

const Star = mongoose.model('star', starSchema, mongoCollection);

console.log("connecting to " + mongoUri);
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

const corsOptions = {
    origin: frontendUrl,
};

app.use(cors());
app.use(express.json());

app.get('/constellation', async (req, res) => {
    const { constellation } = req.query;
    console.log(`calling /constellation for: ${constellation}`);
    try {
        const query = constellation ? { con: { $regex: constellation, $options: 'i' } } : {};
        const stars = await Star.find(query).sort({ mag: 1 });

        let connections = [];
        if (constellation) {
            connections = getConstellationConnections(constellation, stars);
        }

        res.json({ stars, connections });
        console.log(`Found stars: ${stars.length}`);
    } catch (error) {
        console.error('Error fetching star data:', error);
        res.status(500).json({ message: 'internal server error' });
    }
});



// Endpunkt zum Abrufen des API-Schlüssels
app.get('/get-api-key', (req, res) => {
    res.json({ apiKey: OpenAiKey });
});

// Endpunkt zum Generieren von Text basierend auf dem Sternzeichen
app.post('/api/generate-text', async (req, res) => {
    const { starsign } = req.body;

    try {
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Gib mir eine spezifische und detaillierte Beschreibung für das Sternzeichen ${starsign}. Die Beschreibung soll folgende Informationen enthalten: Welche Sterne das Sternzeichen bilden, welcher der hellste und größte Stern ist, seit wann das Sternzeichen bekannt ist, woher der Name kommt und weitere interessante Fakten.`,
                },
            ],
            max_tokens: 100,
        });
        res.json({ text: response.choices[0].message.content });
    } catch (error) {
        console.error('Fehler beim Generieren des Textes:', error);
        res.status(500).json({ error: 'Fehler bei der Textgenerierung' });
    }
});

app.get('/', (req, res) => {
    res.send(`Welcome to the Starbugs API! jetzt aber richtig!`);
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
