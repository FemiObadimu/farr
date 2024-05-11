// generate random  6 digit string...
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

export default generateOTP;