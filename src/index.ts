import express, { NextFunction, Request, Response } from 'express';
import config from './config';
import helmet from 'helmet';
import bodyparser from 'body-parser';
import cors from 'cors';
import requestLogger from './middleware/requestLogger';
import routes from './routes';
import logger from './util/logger';
import { ApiException } from './util/exceptions/ApiException';
const app = express();

// config helmets
app.use(helmet());
// config body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// config cors
app.use(cors());
// add middlewares
app.use(requestLogger);
// config routes
app.use('/', routes);

//config 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
  });
});

// config error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiException) {
    const apiException = err as ApiException;
    logger.error(
      `API Exception of status ${apiException.status}: ${apiException.message}`,
    );
    res.status(apiException.status).json({
      error: apiException.message,
    });
  } else {
    logger.error('Unhandled Error: ' + err.message);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

app.listen(config.port, config.host, () => {
  console.log('Server is running on http://%s:%d', config.host, config.port);
});
