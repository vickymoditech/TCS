import express from 'express';
import routes from './routes';
import { globalErrorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { NODE_ENV } from './config';
import { log } from './utils/logger';
import { startSweeper } from './integrations/saleforceSweeper';
import { authMiddleware } from './middleware/auth';

const app = express();
app.use(express.json());

// start background sweeper unless in test mode
if (NODE_ENV !== 'test') {
  startSweeper();
}

// simple request logger
app.use((req, res, next) => {
  res.on('finish', () => {
    log.info(req.method, req.path, res.statusCode, new Date().toISOString());
  });
  next();
});

// swagger UI for local API inspection (public - no API key required)
const swaggerDocument = YAML.load(__dirname + '/swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount the main router that contains API endpoints
// Apply API auth middleware before routing (no-op in test mode)
app.use(authMiddleware);
app.use(routes);

app.use(globalErrorHandler);

export default app;
