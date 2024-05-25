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
});

const Star = mongoose.model('star', starSchema, mongoCollection);
console.log("connecting to " + mongoUri);
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Beende den Prozess, wenn die Verbindung fehlschlägt
    });

const corsOptions = {
    origin: frontendUrl,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/constellation', async (req, res) => {
    const { constellation } = req.query;
    console.log(`calling /constellation for: ${constellation}`);
    try {
        let stars;
        if (constellation) {
            stars = await Star.find({
                con: { $regex: constellation, $options: 'i' },
                $or: [
                    { bay: { $nin: [null, ''] } },
                    { flam: { $nin: [null, ''] } },
                    { proper: { $nin: [null, ''] } }
                ]
            }).sort({ mag: 1 });
        } else {
            stars = await Star.find({
                $or: [
                    { bay: { $nin: [null, ''] } },
                    { flam: { $nin: [null, ''] } },
                    { proper: { $nin: [null, ''] } }
                ]
            }).sort({ mag: 1 });
        }
        res.json(stars);
        console.log(`Found stars: ${stars.length}`);
    } catch (error) {
        console.error('Error fetching star data:', error);
        res.status(500).json({ message: 'internal server error', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
