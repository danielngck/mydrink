var express = require('express');
var router = express.Router();
const Coffee = require('../models/Coffee');


// Display all coffee products
router.get('/allCoffee', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  // if (!req.session.user.name || req.session.user.name !== 'admin') {
  //     // Send a message and redirect after a delay
  //     return res.status(403).send(`
  //       <h1>Access Denied</h1>
  //       <p>Admins only. You will be redirected to the login page.</p>
  //       <script>
  //         setTimeout(() => {
  //           window.location.href = '/member/login';
  //         }, 5000);
  //       </script>
  //     `);
  //   };

  try {
    const coffee = await Coffee.find();
    res.render('coffee/index', { coffee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// go to Form to create a new coffee product
router.get('/coffeeNew', (req, res) => {
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
  res.render('coffee/new');
});


// Create a new coffee
router.post('/coffeeCreate', async (req, res) => {
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
    const { name, description, price, quantity } = new Coffee(req.body)
    const imageName = req.body.image; // Image field from the form
    const imagePath = `/images/images/${imageName}`;
    const coffee = new Coffee({
      name,
      description,
      price,
      quantity,
      image: imagePath // Save the full path for image
    });
    await coffee.save()

    res.status(200).redirect('/coffees/allCoffee');

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


// 2Update a coffee product
router.put('/:id', async (req, res) => {
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
    // Retrieve the current coffee from the database
    const coffeeDataBase = await Coffee.findById(req.params.id);
   // console.log('coffeeDataBase:', coffeeDataBase.image);
    if (!coffeeDataBase) {
      return res.status(404).json({ error: "Coffee not found" });
    };

    // console.log('req.body.imagePath:', req.body.imagePath);
    // console.log('coffeeDataBase.image:', coffeeDataBase.image);
    // console.log('req.body.image:', `/images/images/${req.body.imagePath}`);
   // Check if a new image was uploaded
   const imagePath = req.body.imagePath ? `/images/images/${req.body.imagePath}` : coffeeDataBase.image;
   //console.log('imagePath:', imagePath);
     // Handle the image path: use the new image from req.body or keep the old one
    const updatedBody = {
      name: req.body.name || coffeeDataBase.name,
      description: req.body.description || coffeeDataBase.description,
      price: req.body.price || coffeeDataBase.price,
      quantity: req.body.quantity || coffeeDataBase.quantity,
      //image: req.body.image || coffeeDataBase.image,
      image: imagePath // Use the new or existing image path
    };

    // Update the coffee in the database
    await Coffee.findByIdAndUpdate(req.params.id, updatedBody, { new: true });
    
    res.status(200).redirect('/coffees/allCoffee');
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


// Delete a coffee product
router.delete('/:id', async (req, res) => {
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
    await Coffee.findByIdAndDelete(req.params.id) // find id and delete
    // res.json({ message: 'Coffee deleted' })
    res.redirect('/coffees/allCoffee');
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

// 1Update a coffee product
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
    const coffee = await Coffee.findById(req.params.id);
    res.render('coffee/edit', { coffee });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching coffee.');
  }
});


// Display all coffee products by Guest
router.get('/allCoffeeGuest', async (req, res) => {
  try {
    const coffee = await Coffee.find()
    res.render('coffee/indexGuest', { coffee })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});



router.get('/allCoffeeList', async (req, res) => {
  try {
    const coffee = await Coffee.find()
    res.json(coffee);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


module.exports = router;