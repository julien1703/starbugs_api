require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const port = process.env.API_PORT | 3000;
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
            // This is where you'd define the connections, based on your constellation data
            // Example: connections = [{from: 'Star1', to: 'Star2'}, ...]
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
    // Example function to define connections based on constellation
    // This should be replaced with your actual logic/data
    let connections = [];
    if (constellation.toLowerCase() === 'leo') {
        // Add connections for the Leo constellation
        connections = [
            // Assuming you have star names or IDs to connect
            { from: 'Regulus', to: 'Denebola' },
            // ... other connections
        ];
    }
    return connections;
}



app.get('/', (req, res) => {
    // console.log("calling root endpoint");
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
