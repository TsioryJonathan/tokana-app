const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const msg = err.message || 'Erreur serveur interne';

  if (err && err.stack) console.error(err.stack);

  if (process.env.NODE_ENV === 'development') {
    return res.status(status).json({ msg, stack: err?.stack });
  }
  return res.status(status).json({ msg });
};

export default errorHandler;