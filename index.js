require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const port = process.env.API_PORT || 3000;
const mongoCollection = process.env.MONGO_COLLECTION;

// .envs created in docker-compose.yml:
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

console.log("connecting to " + mongoUri);
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

const corsOptions = {
    origin: frontendUrl,
};

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

app.get('/constellation', async (req, res) => {
    const { constellation } = req.query;
    console.log(`calling /constellation for: ${constellation}`);
    try {
        const query = constellation ? {
            con: { $regex: constellation, $options: 'i' }
        } : {};
        
        const stars = await Star.find(query).sort({ mag: 1 });

        // Adding code to create connections between stars in a constellation
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
        case 'leo':
            connections.push({ from: 'Regulus', to: 'Denebola' });
            connections.push({ from: 'Denebola', to: 'Zosma' });
            connections.push({ from: 'Zosma', to: 'Algieba' });
            connections.push({ from: 'Algieba', to: 'Adhafera' });
            connections.push({ from: 'Adhafera', to: 'Algenubi' });
            connections.push({ from: 'Algenubi', to: 'Chort' });
            break;
        case 'ori':
            connections.push({ from: 'Betelgeuse', to: 'Bellatrix' });
            connections.push({ from: 'Bellatrix', to: 'Alnilam' });
            connections.push({ from: 'Alnilam', to: 'Mintaka' });
            connections.push({ from: 'Mintaka', to: 'Saiph' });
            connections.push({ from: 'Saiph', to: 'Rigel' });
            break;
        case 'sco':
            connections.push({ from: 'Antares', to: 'Shaula' });
            connections.push({ from: 'Shaula', to: 'Sargas' });
            connections.push({ from: 'Sargas', to: 'Dschubba' });
            connections.push({ from: 'Dschubba', to: 'Alniyat' });
            break;
        case 'lyr':
            connections.push({ from: 'Vega', to: 'Sheliak' });
            connections.push({ from: 'Sheliak', to: 'Sulafat' });
            connections.push({ from: 'Sulafat', to: 'Delta2 Lyr' });
            connections.push({ from: 'Delta2 Lyr', to: 'Zeta2 Lyr' });
            break;
        // Add cases for other constellations here
        default:
            break;
    }

    return connections.filter(connection => starsMap[connection.from] && starsMap[connection.to]);
}

app.get('/', (req, res) => {
    // console.log("calling root endpoint");
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
