var express = require('express');
var router = express.Router();
require('dotenv').config(); // Load environment variables from .env

const mongoUser = process.env.MONGOOSE_USER;
const mongoPass = process.env.MONGOOSE_PASS;

/* GET home page. */
router.get('/', function(req, res, next) {
  const successMessage = req.session.successMessage || null; // Retrieve message
  req.session.successMessage = null; // Clear the message
  // console.log('Retrieved success message:', successMessage);
  res.render('index', { title: 'Panda Cafe Shop', successMessage });
});

const { MongoClient } = require('mongodb')
const client = new MongoClient(`mongodb+srv://${mongoUser}:${mongoPass}@cluster0.peze6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);


// Route to render customer.ejs with comments
router.get('/customers', async (req, res) => {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect()
    }

    const db = client.db('drink')
    const comments = await db
      .collection('comment')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray()

    res.render('base/customer', { comments }) // Update EJS path to base/customer
  } catch (error) {
    console.error('Error rendering customer page:', error)
    res.status(500).send('An error occurred while rendering the page.')
  }
})

// Route to render comments management page
router.get('/page/comments', (req, res) => {
  if (!req.session.user || req.session.user.name !== 'admin') {
    return res.status(403).send(`
      <h1>Access Denied</h1>
      <p>Admins only. You will be redirected to the login page.</p>
      <script>
        setTimeout(() => {
          window.location.href = '/member/login';
        }, 5000);
      </script>
    `);
  }
  res.render('page/comments');
});


router.get('/about',(req,res) => {
  res.render('./base/about.ejs')
}
);

router.get('/get_in_touch',(req,res) => {
  res.render('./base/get_in_touch.ejs')
}
);

router.get('/customerSay',(req,res) => {
  res.render('./base/customer.ejs')
}
);

router.get('/shopMap',(req,res) => {
  res.render('./base/shop.ejs')
}
);


module.exports = router;
