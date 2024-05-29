require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const port = process.env.API_PORT || 3000;
const mongoCollection = process.env.MONGO_COLLECTION;

const mongoUri = process.env.MONGO_URI;
const frontendUrl = process.env.FRONTEND_URL;

const starSchema = new mongoose.Schema({
    proper: String,
    con: String,
    bay: String,
    flam: Number,
    mag: Number,
    x: Number,
    y: Number,
    z: Number,
    color: String,
});

const Star = mongoose.model('star', starSchema, mongoCollection);

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

const corsOptions = {
    origin: frontendUrl,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/constellation', async (req, res) => {
    const { constellation } = req.query;
    console.log(`calling /constellation for: ${constellation}`);
    try {
        const query = constellation ? {
            con: { $regex: constellation, $options: 'i' }
        } : {};
        
        const stars = await Star.find(query).sort({ mag: 1 });

        let connections = [];
        if (constellation) {
            connections = getConstellationConnections(constellation);
        }

        res.json({ stars, connections });
        console.log(`Found stars: ${stars.length}`);
    } catch (error) {
        console.error('Error fetching star data:', error);
        res.status(500).json({ message: 'internal server error' });
    }
});

function getConstellationConnections(constellation) {
    let connections = [];
    switch (constellation.toLowerCase()) {
        case 'aries':
            connections = [
                { from: 'Hamal', to: 'Sheratan' },
                { from: 'Sheratan', to: 'Mesarthim' }
            ];
            break;
        case 'taurus':
            connections = [
                { from: 'Aldebaran', to: 'Elnath' }
            ];
            break;
        case 'gemini':
            connections = [
                { from: 'Castor', to: 'Pollux' },
                { from: 'Pollux', to: 'Alhena' },
                { from: 'Alhena', to: 'Wasat' }
            ];
            break;
        case 'cancer':
            connections = [
                { from: 'Acubens', to: 'Altarf' }
            ];
            break;
        case 'leo':
            connections = [
                { from: 'Regulus', to: 'Denebola' },
                { from: 'Denebola', to: 'Algieba' },
                { from: 'Algieba', to: 'Zosma' }
            ];
            break;
        case 'virgo':
            connections = [
                { from: 'Spica', to: 'Zavijava' },
                { from: 'Zavijava', to: 'Porrima' }
            ];
            break;
        case 'libra':
            connections = [
                { from: 'Zubenelgenubi', to: 'Zubeneschamali' }
            ];
            break;
        case 'scorpio':
            connections = [
                { from: 'Antares', to: 'Shaula' },
                { from: 'Shaula', to: 'Sargas' }
            ];
            break;
        case 'sagittarius':
            connections = [
                { from: 'Kaus Australis', to: 'Nunki' },
                { from: 'Nunki', to: 'Ascella' }
            ];
            break;
        case 'capricorn':
            connections = [
                { from: 'Deneb Algedi', to: 'Dabih' }
            ];
            break;
        case 'aquarius':
            connections = [
                { from: 'Sadalmelik', to: 'Sadalsuud' },
                { from: 'Sadalsuud', to: 'Skat' }
            ];
            break;
        case 'pisces':
            connections = [
                { from: 'Alrescha', to: 'Fumalsamakah' }
            ];
            break;
        default:
            console.log(`No constellation data found for: ${constellation}`);
            break;
    }
    return connections;
}

app.get('/', (req, res) => {
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
