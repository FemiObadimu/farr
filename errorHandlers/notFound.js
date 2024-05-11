const notFound = (req, res) => {
    res.status(404).json({
        status: false,
        message: 'Not Found:This route does not exist',
    });
};

export default notFound
