const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const jwtSecret = 'vkDwTMcoj7m8QSZL/52y4ccvjH6mZLWGCBJ59jIoHG8=';

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017/bidding-web';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Define User and Bid models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

const bidSchema = new mongoose.Schema({
  bid_id: { type: String, required: true, unique: true },
  user_started: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, required: true },
  bidders: [
    {
      user_bidded_email: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  min_price: { type: Number, required: true },
  end_timestamp: { type: Date, required: true },
  status: { type: String },
  buyer: { type: String },
  buyer_price: { type: Number } // Add buyer_price field
});

const User = mongoose.model('User', userSchema);
const Bid = mongoose.model('Bid', bidSchema);

// Serve static files from the "assets" directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login Route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Generate JWT token
      const token = jwt.sign({ email: user.email, name: user.name }, jwtSecret);

      // Set token as a cookie with httpOnly and secure options
      res.cookie('token', token, { httpOnly: false, secure: false });

      // Redirect to '/'
      res.redirect('/');
    } else {
      // Passwords do not match
      res.status(400).redirect('/login');
    }
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).redirect('/login');
  }
});

// Signup Route
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error registering new user');
  }
});

// Bids Route
app.get('/api/bids', authenticateJWT, async (req, res) => {
  try {
    // Fetch bids that match the current user's email
    const bids = await Bid.find({ user_started: req.user.email });
    res.json(bids);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//
app.get('/bids', authenticateJWT, async (req, res) => {
  res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/api/all_bids', async (req, res) => {
  try {
    const bids = await Bid.find({});
    res.json(bids);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Specific Bid Route
app.get('/bid/:bid_id', authenticateJWT, async (req, res) => {
  const { bid_id } = req.params;
  const { request } = req.query;

  try {
    const bid = await Bid.findOne({ bid_id });
    if (!bid) return res.status(404).send('Bid not found');

    if (request === 'edit') {
      if (req.user.email === bid.user_started) {
        res.sendFile(path.join(__dirname, 'edit.html'));
      } else {
        res.redirect('/login');
      }
    } else if (request === 'delete') {
      if (req.user.email === bid.user_started) {
        await Bid.deleteOne({ bid_id });
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    } else if (request === 'accept') {
      // Check if the current user is authorized to accept the bid
      if (req.user.email === bid.user_started) {
        // Find the highest bid
        const maxBid = bid.bidders.reduce((max, bidder) => (bidder.price > max.price ? bidder : max), { price: -Infinity });

        // Update bid status to "sold" in MongoDB and set the buyer
        bid.status = 'sold';
        bid.buyer = maxBid.user_bidded_email;
        bid.buyer_price = maxBid.price;
        await bid.save();
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    } else {
      res.json(bid);
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update Bid Route
app.post('/api/editsave', authenticateJWT, async (req, res) => {
  const { bid_id, title, description, image_url, min_price, end_timestamp } = req.body;

  try {
    // Find the bid by its ID
    const bid = await Bid.findOne({ bid_id });
    if (!bid) return res.status(404).send('Bid not found');

    // Check if the current user is authorized to edit this bid
    if (req.user.email !== bid.user_started) {
      return res.redirect('/login');
    }

    // Update bid details
    bid.title = title;
    bid.description = description;
    bid.image_url = image_url;
    bid.min_price = min_price;
    bid.end_timestamp = new Date(end_timestamp); // Ensure it's a Date object

    await bid.save();

    res.status(200).send('Bid updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// My Purchases Route
app.get('/api/mypurchases', authenticateJWT, async (req, res) => {
  try {
    // Fetch bids where the buyer is the current user's email
    const bids = await Bid.find({ buyer: req.user.email });
    res.json(bids);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/api/newAuction', authenticateJWT, async (req, res) => {
  const { title, description, image_url, min_price, end_timestamp } = req.body;

  try {
    // Generate a unique bid_id using the current timestamp
    const bid_id = Date.now().toString();

    // Create a new bid document
    const newBid = new Bid({
      bid_id,
      user_started: req.user.email,
      title,
      description,
      image_url,
      bidders: [], // Initialize with an empty array of bidders
      min_price,
      end_timestamp: new Date(end_timestamp), // Ensure it's a Date object
      status: 'active', // Set initial status
      buyer: null, // Initialize buyer as null
      buyer_price: null // Initialize buyer_price as null
    });

    // Save the new bid document to the database
    await newBid.save();

    // Send a success response
    res.status(201).json({ message: 'New auction created successfully', bid: newBid });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to apply for a bid
app.post('/applybid/:bid_id',authenticateJWT, async (req, res) => {
    const { bid_id } = req.params;
    const { price } = req.body;
    const userEmail = req.user.email;  // Assuming authenticateJWT sets req.user.email

    
    try {
      // Find the bid by its ID
      const bid = await Bid.findOne({ bid_id });
      console.log('Found Bid:', bid);  // Log the found bid document

      if (!bid) {
        console.log('Bid not found');
        return res.status(404).send('Bid not found');
      }



      // Check if the end timestamp has passed
      if (new Date() > new Date(bid.end_timestamp)) {
        console.log('Auction has ended');
        return res.status(400).send('Auction has ended');
      }

      // Check if the user has already placed a bid
      const existingBid = bid.bidders.find(bidder => bidder.user_bidded_email === userEmail);

      if (existingBid) {
        // If the user has an existing bid, check if the new bid is higher
        if (price <= existingBid.price) {
          console.log('New bid is not higher than the previous bid');
          return res.status(400).send('New bid must be higher than your previous bid');
        }
        
        // Update the existing bid with the new price
        existingBid.price = price;
        console.log('Updated Existing Bid:', existingBid);
      } else {
        // Append the new bid if the user has not placed a bid before
        bid.bidders.push({
          user_bidded_email: userEmail,
          price
        });
        console.log('Added New Bid:', bid.bidders[bid.bidders.length - 1]);
      }

      // Save the updated bid document to the database
      await bid.save();
      console.log('Bid Saved Successfully:', bid);


      // Send a success response
      res.redirect('/');
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).send('Server error');
    }
  });


  app.get('/logout', async (req, res) => {

    res.clearCookie('token');
    res.redirect('/login');
  });
  


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


