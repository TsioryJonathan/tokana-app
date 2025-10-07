const errorHandler = (err, req, res, next) => {
  // Prefer explicit status set by upstream (e.g., validation/services)
  const status = err.status || err.statusCode || 500;
  const msg = err.message || 'Erreur serveur interne';

  // Log full error server-side
  if (err && err.stack) console.error(err.stack);

  // In development, expose stack for easier debugging
  if (process.env.NODE_ENV === 'development') {
    return res.status(status).json({ msg, stack: err?.stack });
  }

  // In production, avoid leaking internals
  return res.status(status).json({ msg });
};

export default errorHandler;