import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  });
};
