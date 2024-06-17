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
        // Add other constellations here yesssss

        default:
            break;
    }

    return connections.filter(connection => starsMap[connection.from] && starsMap[connection.to]);
}

app.get('/', (req, res) => {
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
