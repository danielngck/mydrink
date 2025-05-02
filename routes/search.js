var express = require('express');
var router = express.Router();
const Coffee = require('../models/Coffee')
const Snack = require('../models/Snack');


// Route to handle search requests
router.get('/productSearch', async (req, res) => {
  const searchQuery = req.query.q;
  try {
    if (!searchQuery) {
      return res.status(400).send('Search query cannot be empty');
    }
    // Find products that match the search query ('i' for case-insensitive)
    const coffeeResults = await Coffee.find({
      name: { $regex: searchQuery, $options: 'i' }
    })
    //  console.log('results:', coffeeResults);
    // Render the results using the EJS template
    const snackResults = await Snack.find({
      name: { $regex: searchQuery, $options: 'i' }
    })

    res.render('./base/searchResults', { 
      products1: coffeeResults, 
      products2: snackResults,
      query: searchQuery});  // pass query to the template
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).send('Server error')
  }
})


module.exports = router
