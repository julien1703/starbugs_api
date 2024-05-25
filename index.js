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
        const stars = await Star.find({
            con: { $regex: constellation, $options: 'i' },
            $or: [
                { bay: { $nin: [null, ''] } },
                { flam: { $nin: [null, ''] } },
                { proper: { $nin: [null, ''] } }
            ]
        }).sort({ mag: 1 });
        res.json(stars);
        console.log(`Found stars: ${stars.length}`);
    } catch (error) {
        console.error('Error fetching star data:', error);
        res.status(500).json({ message: 'internal server error' });
    }
});

app.get('/', (req, res) => {
    // console.log("calling root endpoint");
    res.send('Welcome to the Starbugs API!');
});

app.listen(port, () => {
    console.log(`API script is running on port ${port}.`);
});
