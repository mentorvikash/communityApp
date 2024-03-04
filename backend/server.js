const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require("dotenv").config()
const { SECRET_KEY } = process.env;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace <DB_URL> with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/community', { useNewUrlParser: true, useUnifiedTopology: true });

// Define MongoDB schema and model for resources
const resourceSchema = new mongoose.Schema({
    title: String,
    description: String,
    owner: String,
    availability: {
        start: Date,
        end: Date,
    },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});


const Resource = mongoose.model('Resource', resourceSchema);
const User = mongoose.model('User', userSchema);

// API endpoints
app.get('/api/resources', async (req, res) => {
    const resources = await Resource.find();
    res.json(resources);
});

app.post('/api/resources', async (req, res) => {
    const newResource = new Resource(req.body);
    await newResource.save();
    res.status(201).json(newResource);
});

// Update availability for a resource
app.put('/api/resources/:id/availability', async (req, res) => {
    const { id } = req.params;
    const { start, end } = req.body;
    await Resource.findByIdAndUpdate(id, { availability: { start, end } });
    res.sendStatus(200);
});

// Users

// User registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
});

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
