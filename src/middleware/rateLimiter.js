import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

export const generalLimiter = rateLimit({
  // 15 хвилин
  windowMs: 15 * 60 * 1000,

  // Ліміт: 100 запитів для продакшену, 5000 для розробки
  max: isProduction ? 100 : 5000,

  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },

  // Стандартні заголовки Draft-6 (RateLimit-* headers)
  standardHeaders: true,

  // Вимикає заголовок X-RateLimit-* (застарілий)
  legacyHeaders: false,

  // Не рахувати запити, які завершилися помилкою (опціонально)
  skipFailedRequests: !isProduction,

  // Дозволяє довіряти проксі (Render, Heroku, Vercel), якщо вони є
  trustProxy: true,
});

/** * Спеціальний, ще жорсткіший лімітер для логіну та реєстрації
 * (захист від підбору паролів)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 година
  max: isProduction ? 5 : 100, // 5 спроб на годину в проді
  message: {
    message: 'Too many auth attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
