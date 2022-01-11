import express from 'express';

const createServer = () => {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('Hello there!');
  });

  app.listen(port, () => {
    console.info(`The app is listening at http://localhost:${port}.`);
  });
};

export default createServer;
