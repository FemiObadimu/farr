import jwt from 'jsonwebtoken'

const authenticationMiddleware = async (req, res, next) => {
    const token = req.header('farrauth-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No Token, Authorization Denied',
            status: false,
        });
    }
    try {
        const payload = jwt.verify(token, process.env.JWTSECRET);
        req.user = payload.user;
        next();
    } catch (error) {
        return res.status(401).json({
            msg: 'Not Authorized, Please Enter a Valid Token',
            status: false,
        });
    }
};

export default authenticationMiddleware
