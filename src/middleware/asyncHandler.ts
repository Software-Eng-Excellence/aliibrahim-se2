import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = <P = ParamsDictionary>(
  fn: (req: Request<P>, res: Response) => Promise<void>,
) => {
  return (req: Request<P>, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);
};
