
import express from 'express';
import mustacheExpress from 'mustache-express';
import mongoose from 'mongoose';
// import routes from './routes';


const server = express();
server.use(express.json());

// MongoDB connection setup
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/justin_coffee_shop';
mongoose.connect(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.error('MongoDB connection error:', err));


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

// server.use(routes);

export default server;
