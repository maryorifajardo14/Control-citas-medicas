function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    if (status === 500) {
        console.error(err);
    }
    res.status(status).json({
        error: err.name || 'Error',
        message: err.message || 'Error interno del servidor'
    });
}

module.exports = errorHandler;
