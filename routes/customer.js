var express = require('express');
var router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env

const mongoUser = process.env.MONGOOSE_USER;
const mongoPass = process.env.MONGOOSE_PASS;

const client = new MongoClient(`mongodb+srv://${mongoUser}:${mongoPass}@cluster0.peze6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);


router.put('/toggleVisibility/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure client is connected
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const db = client.db("drink");
        
        // Find the current visibility state of the comment
        const comment = await db.collection('comment').findOne({ _id: new ObjectId(id) });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Toggle the visibility state
        const newVisibility = !comment.isVisible;

        const result = await db.collection('comment').updateOne(
            { _id: new ObjectId(id) },
            { $set: { isVisible: newVisibility } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to update visibility.' });
        }

        res.status(200).json({ message: `Comment visibility set to ${newVisibility ? 'visible' : 'invisible'}.` });
    } catch (error) {
        console.error('Error toggling visibility:', error);
        res.status(500).json({ message: 'An error occurred while toggling visibility.' });
    }
});

// Update an existing comment
router.put('/updateComment/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the comment ID from URL
        const { coName, coEmail, coPhone, coMessage } = req.body; // Get updated data from request body

        // Input validation
        if (!coName || !coEmail || !coPhone || !coMessage) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Ensure MongoDB connection
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const db = client.db("drink");
        const result = await db.collection('comment').updateOne(
            { _id: new ObjectId(id) }, // Find comment by ID
            { $set: { coName, coEmail, coPhone, coMessage, updatedAt: new Date() } } // Update fields
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        res.status(200).json({ message: 'Comment updated successfully!' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'An error occurred while updating the comment.' });
    }
});


// Delete a comment
router.delete('/deleteComment/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the comment ID from URL

        // Ensure MongoDB connection
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const db = client.db("drink");
        const result = await db.collection('comment').deleteOne({ _id: new ObjectId(id) }); // Delete by ID

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'An error occurred while deleting the comment.' });
    }
});


// Route to fetch all comments
router.get('/getComments', async function (req, res) {
    try {
        // Ensure the client is connected
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const comments = await client.db("drink").collection('comment')
            .find()
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order (-1)
            .toArray();
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send('An error occurred while fetching the comments.');
    }
});


// Route to render customer.ejs with comments
router.get('/customers', async function (req, res) {
  try {
      // Ensure client is connected
      if (!client.topology || !client.topology.isConnected()) {
          await client.connect();
      }

      const db = client.db("drink");
      const comments = await db.collection('comment').find({}).toArray(); // Fetch all comments

      res.render('page/customer', { comments }); // Pass comments to customer.ejs
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).send('An error occurred while fetching comments.');
  }
});

//sample comment
const comment = [
  {coName: 'Johnny',coEmail: 'johnny@gmail.com',coPhone: '91234567',coMessage: 'Very happy', createdAt: new Date()},
  {coName: 'Sammy',coEmail: 'sammy@gmail.com',coPhone: '69875432',coMessage: 'Great coffee', createdAt: new Date()}
]

router.get('/create', async function (req, res, next) {
  try {
      await client.connect();
      await client.db("drink").collection("comment").insertMany(comment);
      res.send(comment.length + " documents inserted");
  } catch (err) {
      console.log(err.name, err.message);
  } finally {
      client.close();
  }
});

// Add a comment
router.post('/addComment', async function (req, res) {
    try {
        const { coName, coEmail, coPhone, coMessage } = req.body;

        // Input validation
        if (!coName || !coEmail || !coPhone || !coMessage) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Ensure client is connected
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect(); // Reconnect if needed
        }

        const result = await client.db("drink").collection('comment').insertOne({
            coName,
            coEmail,
            coPhone,
            coMessage,
            createdAt: new Date(),
            isVisible: false // Default to invisible
        });

        console.log('Comment saved:', result.insertedId);
        res.status(200).json({ message: 'Comment added successfully!' });
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ message: 'An error occurred while saving the comment.' });
    }
});


// Route to fetch the latest 3 comments
router.get('/getLatestComments', async function (req, res) {
    try {
        // Ensure client is connected
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const db = client.db("drink");
        const comments = await db.collection('comment')
            .find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(3) // Limit to 3 comments
            .toArray();

        res.status(200).json(comments); // Send comments as JSON response
    } catch (error) {
        console.error('Error fetching latest comments:', error);
        res.status(500).send('An error occurred while fetching comments.');
    }
});




router.get('/getAllVisibleComments', async function (req, res) {
    try {
        // Ensure the client is connected
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const comments = await client.db("drink").collection('comment')
            .find({ isVisible: true }) // Filter for visible comments
            .sort({ createdAt: -1 }) // Sort by newest first
            .toArray();
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching visible comments:', error);
        res.status(500).json({ message: 'An error occurred while fetching the visible comments.' });
    }
});


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});





module.exports = router;
