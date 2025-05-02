var express = require('express')
var router = express.Router()
const Comment = require('../models/Comment')

// Get in touch
router.post('/addComment', async function (req, res) {
  try {
    const { coName, coEmail, coPhone, coMessage } = req.body;

    // Input validation
    if (!coName || !coEmail || !coPhone || !coMessage) {
      return res.status(400).send('All fields are required.')
    }

    // Ensure client is connected
    //   if (!client.topology || !client.topology.isConnected()) {
    //       await client.connect(); // Reconnect if needed
    //   }

    // Create a new comment and save it to the database
    // await client.connect(); // mongoose handle connect request internally, not need the statement
    const result = await Comment.create({
      coName,
      coEmail,
      coPhone,
      coMessage,
      createdAt: new Date()
    });

    console.log('Comment saved:', result);
    res.status(200).send('Comment sent successfully!');
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).send('An error occurred while saving the comment.');
  }
});

// Route to fetch the latest 3 comments
router.get('/getLatestComments', async function (req, res) {
  try {
    // Ensure client is connected
    // if (!client.topology || !client.topology.isConnected()) {
    // await client.connect()
    
    // const db = client.db('customer')
    const comments = await Comment.find().sort({ createdAt: -1 });// Sort by newest first
      // .collection('comment')
      // .find({})
      // .sort({ createdAt: -1 }) // Sort by newest first
      // .limit(3) // Limit to 3 comments
      // .toArray()
    console.log(comments);
    res.status(200).json(comments) // Send comments as JSON response
  
  } catch (error) {
    console.error('Error fetching latest comments:', error)
    res.status(500).send('An error occurred while fetching comments.')
  }
})


module.exports = router
