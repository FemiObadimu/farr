const errorHandler = (err, res) => {
    let customError = {
        statusCode: err.statusCode || 500,
        msg: err.message || 'Ooops, something went wrong',
    };

    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(', ');
        customError.statusCode = 400;
    }

    if (err.name === 'CastError') {
        (customError.msg = 'Not Found : Failed because -> CastError Occurred'), (customError.statusCode = 400);
    }

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandler;
