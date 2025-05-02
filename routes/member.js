var express = require('express');
const { body, validationResult } = require("express-validator");
var router = express.Router();

//create Mongodb db entity
var { MongoClient } = require('mongodb');
// var { ObjectId } = require('mongodb');
const cnn = new MongoClient("mongodb+srv://danielng223:erb123@cluster0.peze6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
const ObjectId = require('mongodb').ObjectId;

//import bcrypt
const bcrypt = require('bcrypt');

// Middleware to pass user to response locals
router.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Make user accessible in all views
  next();
});


//Login Page 
router.get('/login', function (req, res, next) {
  // res.send('respond with a resource');
  res.render('./page/login', { title: 'Login Page', message: 'Please input username and password below!'}); 
});

/* POST Login to Authenticate User */
router.post("/login", async (req, res, next) => {
  // Trim the form data
  const urName = req.body.urName?.trim();
  const urPwd = req.body.urPwd;
  // console.log("Trimmed Username:", urName);
  // console.log("Trimmed Password:", urPwd);

// Determine user role
// const role = urName === 'admin' ? 'admin' : 'user';

  try {
    // connect with database
    await cnn.connect();
    // console.log("Database connection successful!");

    // Check users with the database
    const regUser = await cnn.db('drink').collection('tblUser').findOne({ urName });
    // console.log('regUser:', regUser);
    //User does not exist in database
    if (!regUser) { return res.render('./page/login', { title: 'Login Page', message: 'Invalid username' }); }
    // Verify the password using bcrypt
    const isMatch = await bcrypt.compare(urPwd, regUser.urPwd); // Compare entered password with hashed password
    if (!isMatch) {
      return res.render('./page/login', {
        title: 'Login Page',
        message: 'Invalid password',
      });
    }

    // *** Store user info in the session ***
    req.session.user = {
      id: regUser._id,
      name: regUser.urName,
      email: regUser.urEmail
    };


    // Set flash message
    req.session.successMessage = `Welcome, ${req.session.user.name}!`; // Set session message
    // console.log('Success message set:', req.session.successMessage);
    return res.redirect('/'); // Redirect to home page


  } catch (err) {
    console.error(err);
    return res.status(500).render('./page/login', {
      title: 'Login Page',
      message: 'An error occurred. Please try again later.'
    });
  }
});

//Member List Page - Admin only
router.get('/list', async (req, res) => {
  // console.log("Session object:", req.session);
  if (!req.session.user) {
    return res.redirect('/member/login');
  }

  if (!req.session.user.name || req.session.user.name !== 'admin') {
    // console.log('Access denied: User is not admin.');
    return res.status(403).send('Access denied. Admin only.');
  }

  try {
    await cnn.connect();
    // Fetch all users from the database
    const users = await cnn.db('drink').collection('tblUser').find().toArray();
    res.render('./base/member_list', {
      title: 'Members List',
      message: `Members List`,
      users // Pass users to the EJS template
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching users.');
  }
});

/* DELETE a user */
router.delete('/list/:id', async (req, res) => {
  // if (!req.session.user || req.session.user.name !== 'admin') {
  //   return res.status(403).json({ error: 'Access denied. Admins only.' });
  // }

  try {
    await cnn.connect();
    // console.log("Delete:successful database connection!");
    const userId = req.params.id;

    const result = await cnn.db('drink').collection('tblUser').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 1) {
      return res.status(200).json( { message: `User deleted successfully!`} );
    } else {
      return res.status(404).json({ error: `User: ${urName} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the user.' });
  }
});

/* UPDATE user fields */
router.put('/list/:id', async (req, res) => {
  // if (!req.session.user || req.session.user.name !== 'admin') {
  //   return res.status(403).json({ error: 'Access denied. Admins only.' });
  // }

  try {
    await cnn.connect();
    // console.log("Update:successful database connection");
    const userId = req.params.id;
    const updatedData = req.body; // Partial data for update
    // console.log('updatedData',updatedData)
    const result = await cnn.db('drink').collection('tblUser').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedData }
    );
// console.log(updatedData)
    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: `User: ${updatedData.urName} updated successfully!`});
    } else {
      return res.status(404).json({ error: `User: ${updatedData.urName} not found or no changes made.`});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
});

/* Logout  */
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('An error occurred while logging out.');
    }

    // Log the confirmation of session destruction
    // console.log('Session successfully destroyed.');


    // Redirect to home page
    res.redirect('/');
  });
});

//Signup Page
router.get('/signup', function (req, res, next) {
  res.render('./page/signup', {
    title: 'Sign Up',
    errors: { validationErrors: [], chkResult: [] },
  });
});

//Validate data from signup form
router.post('/signup', [ body("urName")
  .notEmpty()
  .withMessage("Username is required.")
  .isLength({ min: 6 })
  .withMessage("Username must be at least 6 characters long."),
body("urEmail")
  .isEmail()
  .withMessage("Please provide a valid email address."),
body("urPwd")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long.")
  .matches(/[a-zA-Z]/)
  .withMessage("Password must contain at least one letter.")
  .matches(/\d/)
  .withMessage("Password must contain at least one number."),
body("cfmpass")
  .custom((value, { req }) => {
    // Check if confirmPassword matches password
    if (value !== req.body.urPwd) {
      throw new Error("Passwords do not match.");
    }
    return true;
  })],
  async (req, res) => {
    // Validation Result
    const errors = validationResult(req);
    const validationErrors = errors.isEmpty() ? [] : errors.array();
    console.error('Validation Errors:', validationErrors);

    //console.log('Request Body:', req.body);


    // Extract validated form data
    const { urName, urEmail, urPwd } = req.body;
    

    try {
      // connect with database
      await cnn.connect();
      const chkResult = [];
      // Check user credentials in the database
      if (urEmail && urName) {
        const emailExist = await cnn.db('drink').collection('tblUser').findOne({ urEmail });
        const userExist = await cnn.db('drink').collection('tblUser').findOne({ urName });
      
        // If fields exist in the database
        if (emailExist || userExist) {
          if (emailExist) {
              chkResult.push('Email is already registered!');
          }
          if (userExist) {
              chkResult.push('Username is not available! please choose another one.');
          }
        };
      
      console.error('Check Result:', chkResult);

      // If there are validation or database-related errors, send them
    if (chkResult.length > 0) {
      return res.status(400).json({
        validationErrors,
        chkResult,
      });
    }};
      // If no errors , proceed to register user
      // Hash the password before storing it in the database
      const hashedPwd = await bcrypt.hash(urPwd, 10); // 10 is the salt rounds
      await cnn.db('drink').collection('tblUser').insertOne({ urName, urEmail, urPwd: hashedPwd });
        // console.log("User has beed added to database.");
      return res.status(201).json({
        success: true,
        message: `User ${urName} signed up successfully !`,
      });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: "An internal server error occurred." });
    } finally {
      // Ensure the database connection is closed
      await cnn.close();
    }
  }
);


//Member List 'login user' Page
router.get('/listOne', async (req, res) => {
  // console.log('Session object:', req.session)
  // console.log('User:', req.session.user.name);
  if (!req.session.user) {
    return res.redirect('/member/login')
  }

  try {
    await cnn.connect();

    const userId = new ObjectId(req.session.user.id);
    // console.log('User ID:', userId)
    // Fetch login user from the database
    const users = await cnn.db('drink').collection('tblUser').findOne({ _id: userId });
    // console.log('Users:', users)
    
    res.render('./base/member_user_list', {
      title: 'Member Details',
      message: `User Details`,
      users // Pass users to the EJS template
    });
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred while fetching user.');
  };
});

// Get User by ID
router.get('/list/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      const user = await cnn.db('drink').collection('tblUser').findOne({ _id: ObjectId(userId) });
      if (!user) {
          return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'An error occurred while retrieving the user' });
  }
});


// Update Single User Details
router.put('/singleList/:userId', async (req, res) => {
  const userId = req.params.userId
  const { urName, urEmail, urPwd } = req.body

  try {
    const userUpdate = {}
    if (urName) userUpdate.urName = urName
    if (urEmail) userUpdate.urEmail = urEmail

    // Update password only if provided
    if (urPwd) {
      const hashedPassword = await bcrypt.hash(urPwd, 10)
      userUpdate.urPwd = hashedPassword
    }

    const result = await cnn
      .db('drink')
      .collection('tblUser')
      .updateOne({ _id: new ObjectId(userId) }, { $set: userUpdate })

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ error: 'User not found or no changes made' })
    }

    res.send({ message: `User: ${urName}  updated successfully!` });

  } catch (error) {
    console.error(error)
    res.status(500).send({ error: 'An error occurred while updating the user' })
  }
});



module.exports = router;
