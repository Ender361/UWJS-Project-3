import mongoose from 'mongoose';
import server from './server.js';

const port = process.env.PORT || 3000;

mongoose
  .connect('mongodb://127.0.0.1/jscript-330-week-5', {})
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(`Failed to start server:`, e);
  });
