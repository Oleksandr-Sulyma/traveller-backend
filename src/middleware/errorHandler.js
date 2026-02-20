import { HttpError } from "http-errors";

export const errorHandler = (err, req, res, next) => {
  console.error("Error Middleware:", err);

  // Якщо помилка створена через http-errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message || err.name,
    });
  }
  const isProd = process.env.NODE_ENV === "production";

  // Усі інші помилки — як внутрішні
  res.status(500).json({
    message: isProd
      ? "Something went wrong. Please try again later."
      : err.message,
  });
};
