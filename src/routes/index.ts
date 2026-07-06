import { Router } from 'express';
const routes = Router();

routes.get('/', (req, res) => {
  // Pass a JavaScript object into res.json()
  res.json({ message: 'Hello, World!' });
});

export default routes;
