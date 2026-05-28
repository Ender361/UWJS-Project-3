import express from 'express';
import mustacheExpress from 'mustache-express';
// import routes from './routes';

const server = express();
server.use(express.json());

// Set up Mustache as the view engine
server.engine('mustache', mustacheExpress());
server.set('view engine', 'mustache');
server.set('views', './views');

// Example route for landing page
server.get('/landing', (req, res) => {
	res.render('landing', { message: 'Hello, World!' });
});

// Homepage route
server.get('/', (req, res) => {
	res.render('landing', { message: 'Hello, World!' });
});

// server.use(routes); // Uncomment and implement routes as needed

export default server;
