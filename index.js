require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.API_PORT || 3000;
const mongoCollection = process.env.MONGO_COLLECTION;
const mongoUri = process.env.MONGO_URI; 
const frontendUrl = process.env.FRONTEND_URL;
const openAiKey = process.env.OPEN_AI_API_KEY;

const openaiClient = new OpenAIApi(new Configuration({
    apiKey: openAiKey,
}));

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

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({ origin: frontendUrl }));
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

function getConstellationConnections(constellation, stars) {
    const connections = [];
    const starsMap = stars.reduce((map, star) => {
        map[star.proper] = star;
        return map;
    }, {});

    switch (constellation.toLowerCase()) {
        case 'ari':
            connections.push({ from: 'Hamal', to: 'Sheratan' });
            connections.push({ from: 'Sheratan', to: 'Mesarthim' });
            break;
        case 'tau':
            connections.push({ from: 'Aldebaran', to: 'Elnath' });
            break;
        case 'gem':
            connections.push({ from: 'Castor', to: 'Pollux' });
            break;
        case 'cnc':
            connections.push({ from: 'Acubens', to: 'Altarf' });
            break;
        case 'leo':
            connections.push({ from: 'Regulus', to: 'Denebola' });
            connections.push({ from: 'Denebola', to: 'Zosma' });
            connections.push({ from: 'Zosma', to: 'Algieba' });
            connections.push({ from: 'Algieba', to: 'Adhafera' });
            connections.push({ from: 'Adhafera', to: 'Algenubi' });
            connections.push({ from: 'Algenubi', to: 'Chort' });
            break;
        case 'vir':
            connections.push({ from: 'Spica', to: 'Vindemiatrix' });
            break;
        case 'lib':
            connections.push({ from: 'Zubenelgenubi', to: 'Zubeneschamali' });
            break;
        case 'sco':
            connections.push({ from: 'Antares', to: 'Shaula' });
            connections.push({ from: 'Shaula', to: 'Sargas' });
            connections.push({ from: 'Sargas', to: 'Dschubba' });
            connections.push({ from: 'Dschubba', to: 'Alniyat' });
            break;
        case 'sgr':
            connections.push({ from: 'Kaus Australis', to: 'Nunki' });
            break;
        case 'cap':
            connections.push({ from: 'Deneb Algedi', to: 'Dabih' });
            break;
        case 'aqr':
            connections.push({ from: 'Sadalmelik', to: 'Sadalsuud' });
            break;
        case 'psc':
            connections.push({ from: 'Alrescha', to: 'Eta Piscium' });
            break;
        case 'ori':
            connections.push({ from: 'Betelgeuse', to: 'Bellatrix' });
            connections.push({ from: 'Bellatrix', to: 'Alnilam' });
            connections.push({ from: 'Alnilam', to: 'Mintaka' });
            connections.push({ from: 'Mintaka', to: 'Saiph' });
            connections.push({ from: 'Saiph', to: 'Rigel' });
            break;
        case 'lyr':
            connections.push({ from: 'Vega', to: 'Sheliak' });
            connections.push({ from: 'Sheliak', to: 'Sulafat' });
            connections.push({ from: 'Sulafat', to: 'Delta2 Lyr' });
            connections.push({ from: 'Delta2 Lyr', to: 'Zeta2 Lyr' });
            break;
        default:
            break;
    }

    return connections.filter(connection => starsMap[connection.from] && starsMap[connection.to]);
}

app.post('/api/generate-text-stream', async (req, res) => {
    const { starsign } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const response = await openaiClient.createChatCompletion({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `Gib mir eine spezifische und detaillierte Beschreibung in 100 Wörtern für das Sternzeichen ${starsign}. Die Beschreibung soll die Themen behandeln: Welche Sterne das Sternzeichen bilden, welcher der hellste und größte Stern ist, seit wann das Sternzeichen bekannt ist, die historischen Hintergründe und Entdeckungsgeschichten, woher der Name kommt.`,
                },
            ],
            max_tokens: 400,
            stream: true,
        });

        response.data.on('data', data => {
            const lines = data.toString().split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                const message = JSON.parse(line);
                if (message.choices && message.choices[0].delta && message.choices[0].delta.content) {
                    res.write(`data: ${message.choices[0].delta.content}\n\n`);
                }
            }
        });

        response.data.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error('Fehler beim Generieren des Textes:', error);
        res.status(500).send('Fehler bei der Textgenerierung.');
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
