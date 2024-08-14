const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Mongoose Schema and Model
const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
});

const Movie = mongoose.model('Movie', movieSchema);
const connectionString = process.env.MONGO_URI 

// MongoDB Connection
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET Request: Fetch all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find(); // Fetch all movies from the database
    res.json(movies); // Send the movies as JSON response
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST Request: Add a new movie
app.post('/movies', async (req, res) => {
  try {
    const { title, year } = req.body; // Extract movie data from the request body

    const newMovie = new Movie({ title, year }); // Create a new movie instance
    await newMovie.save(); // Save the movie to the database

    res.status(201).json(newMovie); // Send the saved movie as JSON response
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Default GET Request: Root Endpoint
app.get('/', (req, res) => {
  console.log("A request has been received.");
  const responseData = {
    message: 'Node JS API Server for the CLO835 project is running successfully!',
    status: 'success',
    timestamp: new Date().toISOString()
  };
  res.json(responseData);
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
