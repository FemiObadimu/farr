// generate random  6 digit string...
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
