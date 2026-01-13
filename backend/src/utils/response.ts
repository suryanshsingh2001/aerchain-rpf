import { Response } from "express";
import { ApiResponse } from "../types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse<T>["meta"]
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message,
      statusCode,
      details,
    },
  };
  res.status(statusCode).json(response);
}
