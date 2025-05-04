require('dotenv').config();
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
require('dotenv').config(); // Load environment variables from .env

const mongoUser = process.env.MONGOOSE_USER;
const mongoPass = process.env.MONGOOSE_PASS;

//create Mongodb db entity
var { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cnn = new MongoClient(`mongodb+srv://${mongoUser}:${mongoPass}@cluster0.peze6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);


const nodemailer = require('nodemailer');
// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider
  auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS   // Your generated app password
  }
});
// Function to send order confirmation email
// const sendOrderConfirmation = (orderDetails, customerEmail) => {
//   const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: customerEmail,
//       subject: 'Order Confirmation',
//       text: `Thank you for your order! Here are your order details:\n\n${orderDetails}`
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//           return console.log('Error occurred: ' + error.message);
//       }
//       console.log('Email sent: ' + info.response);
//   });
// };


// Create a new order
router.post('/createOrder', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };
  // console.log('req.body:', req.body);
  const { items, totalAmount, customerName, customerEmail } = req.body;
  // console.log('customerName',customerName)
  // console.log('session user name',req.session.user.name)
  const userName = req.session.user.name; // Retrieve userId from session
  const userId = req.session.user.id
  // Verify if the customerName matches the session user name
  if (customerName !== userName) {
    return res.status(400).json({ Error: 'User name does not match the login user.' });
  }

  try {
    const referenceNumber = await Order.getNextReferenceNumber(); // Get the next reference number
    const newOrder = new Order({ items, totalAmount, customerName, customerEmail, userId,
      referenceNumber });
    await newOrder.save();

    // Send confirmation email
    const orderDetails = items.map(item => `
      <tr>
          <td>${item.productName}</td>
          <td>${item.quantity.toLocaleString()}</td>
          <td>$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>`).join('');
    
    const totalAmountFormatted = totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const mailOptions = {
      from: `EMAIL_USER`,
      to: customerEmail,
      subject: 'Order Confirmation - ( Ref: ' + referenceNumber + ' ) Date: ' + new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }),
      html: `
            <p>Hello ${customerName},</p>
            <p>Thank you for your order!</p>
            <h3>Here are your order details:</h3>
            <table style="border-collapse: collapse; width: 100%;margin: 20px auto; font-family: Arial, sans-serif;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left;">Product Name</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left;">Quantity</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetails}
                </tbody>
            </table>
            <h3>Total Amount: $${totalAmountFormatted}</h3>
            <p>Thank you for shopping with us!</p>`,
    };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });

  // res.status(200).send('Order processed and email sent!');

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Place order form
router.get('/orderIndex', (req, res) => {
try {
    if (!req.session.user) {
      return res.redirect('/member/login');
    };
    res.render('./base/order.ejs', { user: req.session.user, title: 'Panda Cafe Shop' })}
catch (error) {
    res.status(500).json({ error: error.message })};
});


router.get('/checkout', (req, res) => {
  try {
        res.render('./base/checkout'); 
      } catch (error) {
      res.status(500).json({ error: error.message });
}
});

// Route to fetch user's order history
router.get('/orderHistory', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };
// console.log('session user',req.session.user)

  try {
      const orders = await Order.find({ customerName: req.session.user.name }).sort({ orderDate: -1 }); // Fetch orders for the logged-in user
      res.render('./base/orderHistory', { orders });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});


// Update order status
router.post('/update-status/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      res.json(order);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Delete an order
router.delete('/delete/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  try {
      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: 'Order deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Get order history for a specific user
router.get('/user/:userId', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  const { userId } = req.params;
  try {
      const orders = await Order.find({ userId }).sort({ orderDate: -1 });
      res.json(orders);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});


// Get all unique user IDs and usernames who have placed orders
router.get('/users/all', async (req, res) => {
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
      await cnn.connect();
      // Fetch distinct userIds from the Order collection
      const userIds = await cnn.db('drink').collection('order').distinct('userId');
      if (userIds.length === 0) {
          return res.json([]); // Return empty array if no users found
      }
      
      // Fetch user details based on the unique user IDs
      const users = await cnn.db('drink').collection('tblUser').find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray();
      
      // Map user details to include userId and username
      const userDetails = users.map(user => ({
          userId: user._id,
          userName: user.urName,
          userEmail: user.urEmail
      }));

      res.json(userDetails); // Return the user objects
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});



router.get('/admin-order-history', (req, res) => {
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
      res.render('./base/admin-order-history.ejs', 
        { user: req.session.user, title: 'Admin order history' })}
  catch (error) {
      res.status(500).json({ error: error.message })};
  });


// Function to fetch all orders
async function getAllOrders() {
    return await Order.find().sort({ orderDate: -1});
}

// Route to fetch all user's order history (for admin)
router.get('/adminOrderHistory', async (req, res) => {
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
        const orders = await getAllOrders(); // Fetch all orders
        res.render('./base/admin-order-history', { orders }); // Render template
    } catch (error) {
        console.error(error);
        res.status(500).send('Database Server Error');
    }
});

// Route to fetch all orders as JSON (for admin)
router.get('/adminOrderHistoryJson', async (req, res) => {
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
        const orders = await getAllOrders(); // Fetch all orders
        res.json(orders); // Send orders as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Database Server Error');
    }
});

//route to handle order deletion
router.delete('/deleteOrder/:id', async (req, res) => {
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
      const { id } = req.params;
      await Order.findByIdAndDelete(id);
      res.status(204).send(); // No content
  } catch (error) {
      console.error(error);
      res.status(500).send('Database Server Error');
  }
});

//update order status (for admin)
router.patch('/update/:id', async (req, res) => {
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

  const orderId = req.params.id;
  const { status } = req.body;

  try {
      // Fetch the current order
      const currentOrder = await Order.findOne({ _id: new ObjectId(orderId) });
      if (!currentOrder) {
          return res.status(404).json({ message: 'Order not found' });
      }

      // Check if the status is different
      if (currentOrder.status === status) {
          return res.status(400).json({ message: 'Status is already set to the current value' });
      }

      // Perform the update
      const result = await Order.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status } }
      );

      if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'Order not found or status not updated' });
      }

      res.json({ message: 'Order status updated successfully' });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

//Get all users' orders (in admin order history)
router.get('/orders/all', async (req, res) => {
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
      const orders = await Order.find(); // Fetch all orders from the database
      res.json(orders);
  } catch (error) {
      res.status(500).send('Failed to load orders');
  }
});

router.get('/currentOrders', (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ error: 'User not logged in' });
  }

  // Get the most recent order
  const currentOrders = req.session.orders || [];
  const latestOrder = currentOrders[currentOrders.length - 1]; // Get the last order if it exists

  if (!latestOrder) {
      return res.json([]); // Return an empty array if no orders exist
  }
  // Log the latest order for debugging
  // console.log('Latest Order:', latestOrder); 
  res.json([latestOrder]); // Return the latest order as an array
});


router.post('/addToCart', (req, res) => {
  if (!req.session.user) {
      return res.redirect('/member/login');
  }

  const { items, totalAmount } = req.body;

  // Initialize orders in session if not already done
  if (!req.session.orders) {
      req.session.orders = [];
  }

  // Create a new order
  const newOrder = {
      items,
      totalAmount,
      orderDate: new Date(),
      status: 'pending' // Mark as pending until submitted
  };

  req.session.orders.push(newOrder); // Add to session orders
  // console.log('Order added to session:', newOrder);
  // console.log('Current Orders in Session:', req.session.orders); // Log current orders
  res.status(201).json(newOrder); // Respond with the new order
});

// Add this route to handle clearing the cart
router.post('/clear', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/member/login');
  };

  if (req.session.user) {
      req.session.orders = []; // Clear session orders
      res.json({ success: true });
  } else {
      res.status(401).json({ error: 'User not logged in' });
  }
});


// Export the function
module.exports = router;