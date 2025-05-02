var express = require('express');
var router = express.Router();
const Snack = require('../models/Snack');


// Display all snack products
router.get('/allSnack', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  // if (!req.session.user.name || req.session.user.name !== 'admin') {
  //       // Send a message and redirect after a delay
  //       return res.status(403).send(`
  //         <h1>Access Denied</h1>
  //         <p>Admins only. You will be redirected to the login page.</p>
  //         <script>
  //           setTimeout(() => {
  //             window.location.href = '/member/login';
  //           }, 5000);
  //         </script>
  //       `);
  //     };

  try {
    const snack = await Snack.find();
    res.render('snack/index', { snack });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// go to Form to create a new snack product
router.get('/snackNew', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  if (!req.session.user.name || req.session.user.name !== 'admin') {
        // Send a message and redirect after a delay
        return res.status(403).send(`
          <h1>Access Denied</h1>
          <p>Admins only. You will be redirected to the login page.</p>
          <script>
            setTimeout(() => {
              window.location.href = '/member/login';
            }, 5000);
          </script>
        `);
      };
  res.render('snack/new');
});


// Create a new snack
router.post('/snackCreate', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  if (!req.session.user.name || req.session.user.name !== 'admin') {
        // Send a message and redirect after a delay
        return res.status(403).send(`
          <h1>Access Denied</h1>
          <p>Admins only. You will be redirected to the login page.</p>
          <script>
            setTimeout(() => {
              window.location.href = '/member/login';
            }, 5000);
          </script>
        `);
      };

  try {
      const { name, description, price, quantity } = new Snack(req.body)
      const imageName = req.body.image; // Image field from the form
      const imagePath = `/images/images/${imageName}`;
      const snack = new Snack({
        name,
        description,
        price,
        quantity,
        image: imagePath // Save the full path for image
      });
      await snack.save()
  
      res.status(200).redirect('/snacks/allSnack');
  
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  });


// Update snack product
router.put('/:id', async (req, res) => {
  try {
    // Retrieve the current coffee from the database
    const snackDataBase = await Snack.findById(req.params.id);

    if (!snackDataBase) {
      return res.status(404).json({ error: "Snack not found" });
    };

    // Check if a new image was uploaded
   const imagePath = req.body.imagePath ? `/images/images/${req.body.imagePath}` : snackDataBase.image;
   //console.log('imagePath:', imagePath);

     // Handle the image path: use the new image from req.body or keep the old one
    const updatedBody = {
      name: req.body.name || snackDataBase.name,
      description: req.body.description || snackDataBase.description,
      price: req.body.price || snackDataBase.price,
      quantity: req.body.quantity || snackDataBase.quantity,
      // image: req.body.image || snackDataBase.image,
      image: imagePath // Use the new or existing image path
    };

    // Update the coffee in the database
    await Snack.findByIdAndUpdate(req.params.id, updatedBody, { new: true });
    res.status(200).redirect('/snacks/allSnack');
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


// Update snack
router.get('/:id/edit', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  if (!req.session.user.name || req.session.user.name !== 'admin') {
        // Send a message and redirect after a delay
        return res.status(403).send(`
          <h1>Access Denied</h1>
          <p>Admins only. You will be redirected to the login page.</p>
          <script>
            setTimeout(() => {
              window.location.href = '/member/login';
            }, 5000);
          </script>
        `);
      };
      
  try {
    const snack = await Snack.findById(req.params.id);
    res.render('snack/edit', { snack });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching coffee.');
  }
});

// Delete snack
router.delete('/:id', async (req, res) => {
  try {
    await Snack.findByIdAndDelete(req.params.id) // find id and delete
    // res.json({ message: 'Coffee deleted' })
    res.redirect('/snacks/allSnack');
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


// Display all snack products by Guest
router.get('/allSnackGuest', async (req, res) => {
  try {
    const snack = await Snack.find()
    res.render('snack/indexGuest', { snack })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


router.get('/allSnackList', async (req, res) => {
  try {
    const snack = await Snack.find()
    res.json(snack);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


module.exports = router;