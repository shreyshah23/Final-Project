const express = require('express');
const cors = require('cors');
const exphbs = require('express-handlebars');
const db = require('./db');

const app = express();
const { validationResult, query } = require('express-validator');
// Set up Handlebars view engine
app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors());
app.use(express.json());

const mongoConnectionString = 'mongodb+srv://shreyshah2300:shrey23@cluster0.jsxfico.mongodb.net/sample_restaurants?retryWrites=true&w=majority';

db.initialize(mongoConnectionString);

app.get('/api/test', async (req, res) => {
  try {
    await db.initialize(mongoConnectionString);
    res.status(200).send('Connected to MongoDB Atlas and Initialized Restaurant Model');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST /api/restaurants
app.post('/api/restaurants', async (req, res) => {
  try {
    const newRestaurant = await db.addNewRestaurant(req.body);
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/restaurants
const validateQueryParams = [
    query('page').isNumeric().toInt(),
    query('perPage').isNumeric().toInt(),
    query('borough').optional(), // Optional parameter, no validation applied
  ];
  
  app.get('/api/restaurants', validateQueryParams, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { page = 1, perPage = 10, borough } = req.query;
      // Your logic to fetch restaurants based on page, perPage, and optional borough
      // Call the db.getAllRestaurants function passing the validated parameters
      const restaurants = await db.getAllRestaurants(parseInt(page), parseInt(perPage), borough);
      res.status(200).json(restaurants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



// Route to render the form
app.get('/restaurant-search', (req, res) => {
    // Render your form view (form.hbs in this case)
    res.render('form');
  });
  
  // Route to handle form submission and display results
  app.get('/search', async (req, res) => {
    try {
      const { page, perPage, borough } = req.query;
      
      // Fetch restaurantsData using your database function, e.g., db.getAllRestaurants()
      const restaurantsData = await db.getAllRestaurants();
      
      // Simulating data retrieval based on query parameters
      const restaurants = restaurantsData.slice((page - 1) * perPage, page * perPage);
      console.log(restaurants);
  
      // Render the results view (results.hbs in this case) with the fetched data
      res.render('results', { restaurants });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Error fetching data');
    }
  });

// GET /api/restaurants/:id
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await db.getRestaurantById(id);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      res.status(200).json(restaurant);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRestaurant = await db.updateRestaurantById(req.body, id);
    if (!updatedRestaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      res.status(200).json(updatedRestaurant);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE /api/restaurants/:id
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRestaurant = await db.deleteRestaurantById(id);
    if (!deletedRestaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
