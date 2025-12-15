  import express, { Router } from 'express';
  import cors from 'cors';

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const port = 3000;

  app.get('/', (req, res) => {
    res.send('Hello from TypeScript Node.js Server!');
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });