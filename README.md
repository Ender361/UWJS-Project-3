# Justin's Coffee Shop

This is my final back-end project for the University of Washington full stack with Javascript certificate. It’s a coffee shop API with login, menu management,
and order handling.

I kept the idea pretty simple on purpose so I could finish it on time and be able to easily add more.

## What it does

- user registration and login
- token-based authentication
- role-based authorization for admin routes
- CRUD for menu items
- CRUD for orders
- text search on menu items
- aggregation for order summary stats
- Jest tests with line coverage above 80%

## Tech stack

- Node.js
- Express
- MongoDB with Mongoose
- Jest for testing

## Folder structure

- `server.js` — Express app setup
- `index.js` — database connection and app startup
- `routes/` — API route handlers
- `models/` — Mongoose models
- `middleware/` — authentication and authorization middleware
- `utils/` — token helper functions
- `views/` — Mustache landing page

## Main features

### Authentication and authorization

- `POST /auth/register` - Register a user (name, email, password, role)
- `POST /auth/login` - Login a user
- `GET /auth/me` - Returns logged in user
- `GET /auth/admin-check` - Checks if logged in as admin

Users get a signed token after login or registration. Admin-only endpoints are protected with role checks.

### Menu routes

- `GET /menu` - Returns current menu
- `GET /menu/search?q=latte` - Returned searched item(s)
- `GET /menu/:id` - Returns searched item by id
- `POST /menu` — Creates a menu item, admin only (name, description, price, category, available boolean)
- `PATCH /menu/:id` — Modifies a menu item, admin only
- `DELETE /menu/:id` — Deletes a menu item, admin only

### Order routes

- `GET /orders` - Returns orders for logged in user, or all for admins
- `GET /orders/:id` - Returns an order by specific id, admin or user order only
- `POST /orders` - Creates an order
- `PATCH /orders/:id` - Modifies an existing order by id
- `DELETE /orders/:id` — Deletes an order by id, admin only
- `GET /orders/stats/summary` — Returns total orders and revenue, admin only

## Data model notes

The MongoDB models include indexes and constraints where they actually help:

- `User.email` is unique and indexed
- `MenuItem.name` is unique and indexed
- menu items use a text index for search
- orders are indexed by `user`, `status`, and `createdAt`

## Testing

I used **Jest** for the test suite and stuck mostly to unit-style route and middleware tests.

Current coverage from the last run:

- **Line coverage:** 96.57%
- **All tests passing:** 47/47

The tests cover:

- token helpers
- auth middleware
- landing/health route behavior
- user model password hashing and verification
- order model validation
- auth routes
- menu routes
- order routes

## What I learned

Mostly from this project I learned how to use Mustache with front end user interaction for connecting with back end api calls, how to setup a basic framework for back end apis, and how to write jest unit tests into my code. 

### What worked well

- Breaking the app into routes, middleware, models, and utilities kept things manageable.
- Adding indexes and search/aggregation features made the project feel closer to a real app and scale better with added changes.
- Keeping the front end simple let me focus on the API work.

### What did not work as well

- I spent a lot of time just getting the initial framework started and to look like something we had done in class so far.
- I feel like I could have used a better system to make the front end work, the one massive mustache file feels confusing.
- I still do not feel as comfortable writing tests as I wish I was.
- I used ai to help with a lot of features, which was useful, but specifically for the front end and the jest tests I feel like I would have understood it better if I had used less ai. 

### What I would do differently

- Start with the final models and routes earlier.
- Write tests alongside each feature instead of saving them for the end.
- Keep auth simpler from the start.
- Stick to a smaller set of features and polish those first.

## Future improvements

If I kept working on this project, I would probably add:

- password updates and account management
- order history filtering and more detailed analytics
- a more advanced front end with a more polished and pretty user interface
- better validation and error formatting

## Running the project

Start the app:

- `npm start`

Run the tests:

- `npm test -- --coverage --runInBand`

## Final reflection

Overall, I feel happy with how this project turned out, it meets the requirements and I definitely feel more skilled in creating websites like this, it just feels like to really hone this skill I would make a bunch of websites somewhat similar to this to learn intricacies and muscle memory better.

The biggest thing I took away from it is that a finished project is better than a huge unfinished one. I think one of my favorite parts of this project is I would feel comforatable changing and improving it.




1. Something I've always been interesting in doing with my CS knowledge is helping small businesses create fun, interactive, and functional websites. This project is gonna be a simple coffee shop that always (fake) online ordering.
2. A lot of small businesses have websites that link to external ordering services such as Toast, Chownow, or Clover. But I think having a proprietary ordering service shows more individuality, creativity, and keeps people thinking about your business more specifically.
3. At the start of the project, my focus will be creating routes for admins to add items to the menu along with prices, modify existing menu items and prices, and view current orders and order statistics. I also want to add functionality for the user to view items and prices, and order items. I will need to add Daos for items, ordering, and users, along with maybe statistics for order history and trends.
4. I will use express API and use authentication and authorization for admins to modify the menu, use different CRUD routes for orders, items, and updates, indexes and uniqueness to make my code clear, concise, and readable, and use text search and aggregations for efficiency. I will also spend time writing my own unit tests. I am not currently planning to use an external api yet. I have a poor tendency of overcommitting to large projects and procrastinating, so for this project I'm going to start small and then add improvements and increased functionality.
5. My plan is to focus on the week 7 homework until it's due on May 20th, using this time to think more about how I want this final project to turn out and what changes I might make to my goals. From the 20th to the 27th I want to start work on the project and get some basic functionality done, creating a very basic but functional api. And from the 27th until the final class June 2nd I plan to refine the project, making sure it meets requirements and then focusing on adding more and thinking about how I could go further.
