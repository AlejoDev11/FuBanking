import express, { Application, Request, Response, Router } from 'express';
import { errorHandler } from '../../presentation/middlewares/errorHandler';

/**
 * Bootstrap compartido de apps Express de prueba.
 * Monta un router bajo un basePath con el contrato común:
 * JSON + 404 `{success:false,error:{code:'NOT_FOUND'}}` + `errorHandler`.
 * Usado por createTestApp (auth) y createLoanTestApp (créditos).
 */
export function mountTestApi(router: Router, basePath: string): Application {
  const app = express();
  app.use(express.json());
  app.use(basePath, router);
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
  });
  app.use(errorHandler);
  return app;
}
