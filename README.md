AuXion Bidding and Auctions Website

Table of Contents

    1. Introduction
    2. Technologies Used
    3. Features
    4. UI Pages
        1. Index Page
        2. Login and Signup Pages
        3. Projects Page
        4. Edit Page
    5. Backend Setup
        1. Database
        2. Schemas
        3. Routes
        4. Middlewares
    6. Client-side JavaScript
    7. Routes
    8. Middleware
    9. Running


Introduction

AuXion is a bidding and auctions website where users can register, login, place bids on items, and manage their auctions. The application is built using HTML, CSS, JavaScript, Node.js, Express, Bootstrap for styling, and MongoDB for the database.


Technologies Used

    1. HTML, CSS, JavaScript
    2. Node.js, Express
    3. MongoDB
    4. Bootstrap
    5. JSON Web Tokens (JWT)
    6. Bcrypt for password hashing


Features

    1. User authentication (Login, Signup, Logout)
    2. Display available bids
    3. Apply for bids
    4. Add new auctions
    5. Edit auctions
    6. View past bids and purchases


UI Pages

    1. Index Page - The main landing page where users can see available bids.

    2. Login and Signup Pages - Pages for user authentication. Users can register and log in to the website.

    3. Projects Page - Users can: 
                                1. Add new bids
                                2. Check their purchases
                                3. View their past bids

    4. Edit Page - Users can edit auctions they have created.



Backend Setup

Database
We use MongoDB to store user and bid information.

Schemas

    1. User Schema
    2. Bid Schema



Client-side JavaScript

    1. auth.js - Contains functions to: 
                            1. POST user login data to /login
                            2. Check whether the user is authenticated

    2. main.js - Manages the display of login, signup, and logout buttons based on the current user status.

    3. signup.js. Contains functions to:
                            1. POST user signup data to /signup



Routes

    Main Routes
        1. /: Home page
        2. /login: Login page
        3. /signup: Signup page
        4. /logout: Logout endpoint
        5. /bids: Bids page

    API Routes
        1. /api/bids: Fetch bids
        2. /api/all_bids/: Fetch all bids
        3. /bid/<bid_id>/: View a specific bid
        4. /applybid/<bid_id>: Apply for a specific bid
        5. /api/newAuction: Create a new auction
        6. /api/mypurchases: View purchases
        7. /api/editsave: Save edited auction

Middlewares

    1. auth: Handles user authentication
    2. authenticateJWT: Verifies JWT tokens
    3. cookieparser: Parses cookies
    4. bodyparser: Parses request bodies
    5. bcrypt: Hashes passwords with 10 iterations
    6. jsonwebtoken: Manages JWT tokens


Run

    1. Install Dependencies 
    -- npm install 

    2. Start the Server 
    -- node server.js 

    3. Access the Website
    Open your browser and go to http://localhost:3000