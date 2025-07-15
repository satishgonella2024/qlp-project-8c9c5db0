import express, { Application } from 'express';
import { configureApp } from './config/appConfig';
import { userRoutes } from './routes/userRoutes';

const app: Application = express();
const port = process.env.PORT || 3000;

configureApp(app);
userRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});