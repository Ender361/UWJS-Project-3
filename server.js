
import express from 'express';
import mustacheExpress from 'mustache-express';
import routes from './routes/index.js';


const server = express();
server.use(express.json());

server.engine('mustache', mustacheExpress());
server.set('view engine', 'mustache');
server.set('views', './views');

server.use('/', routes);

server.get('/landing', (req, res) => {
	res.render('landing', { message: 'Justin\'s Coffee Shop' });
});

server.get('/', (req, res) => {
	res.render('landing', { message: 'Justin\'s Coffee Shop' });
});

export default server;
