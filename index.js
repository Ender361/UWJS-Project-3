import mongoose from 'mongoose';
import server from './server.js';

const port = 3000;
const mongoURI = 'mongodb://127.0.0.1:27017/justin_coffee_shop';

mongoose
  .connect(mongoURI)
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on http://localhost:${port}`);
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', e);
  });
