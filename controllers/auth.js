import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import mailgun from 'mailgun-js'
import bcrypt from 'bcryptjs/dist/bcrypt.js';
const DOMAIN = process.env.MAILGUN_SERVER;
import helper from '../utils/helpers/help.js'

// @THIS Block of Code, Registers the User
export const register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({
                status: false,
                msg: 'Enter all Fields',
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                status: false,
                msg: 'User with this Email Address Already Exist!',
            });
        }

        const salt = await bcrypt.genSaltSync(12);
        const hashpassword = await bcrypt.hash(password, salt);
        const otp = helper.generateOTP();
        const hashedOtp = await bcrypt.hash(String(otp), salt);


        const customers = await User.find({}); // get all customers...
        // save customer details
        const newUser = await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email.toLowerCase(),
            password: hashpassword,
            otpToken: hashedOtp,
            isAccountVerified: false,
            isEmailVerified: false,
            kyc_complete: false,
            customer_reference: `OGA-${customers.length + 1}`,
        });

        await newUser.save(); // store customer data...
        const createdUser = await User.findOne({ email }).select('-password');
        if (!createdUser) {
            return res.status(400).json({
                status: false,
                msg: 'User does not exist',
            });
        }
        const payload = {
            user: {
                id: createdUser._id,
                firstname: createdUser.firstname,
                lastname: createdUser.lastname,
                email: createdUser.email,
            },
        };
        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: process.env.JWTLIFETIME,
        });

        const mg = mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: DOMAIN,
        });

        const data = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: 'Ogamoni Account Activation',
            html: `
                       <div>
                            <p>
                                Hello there, <br/>
                           </p>
                            <p style="">
                                 Welcome Onboard, we are thrilled to announce that you've successfully created an account on Ogamoni, the Budgeting of
                               funds and payments! 🎉
                            </p>
                            <p>
                              Welcome to Ogamoni <br/> Explore the world of endless possibilities with Ogamoni. <br/>
                              Enter the OTP Verification Code to verify your email address.
                            </p>
                    
                            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
                            Your Verification Code.
                            </h3>
                                <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                                    ${otp}
                                </h1>

                             <p>
                                From the Ogamoni Team.<br/>
                                Join Our Social Media Handles for Updates.
                             </p>


                            <div style="padding:5px 0px; text-align:center; display:flex; flex-direction:column; justify-content:center; ">
                                <div style="padding:2px; ">
                                    <a href="https://www.linkedin.com/company/ogamonihq/" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/linkedin%20(1).png?updatedAt=1698255926190" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://www.instagram.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/instagram%20(1).png?updatedAt=1698255925991" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://twitter.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/twitter%20(1).png?updatedAt=1698255925981" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                            </div>
                            <div style="padding:5px 0px; text-align:center ">
                                <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/ogamoniwhite_bs-qbr_RK.png?updatedAt=1698255468184" alt="ogamoni" height="100px" />
                            </div>

                            <div style="padding:10px 0px 0px 0px; text-align:center;">
                                © Copyright. ogamoni.com
                            </div>
                       </div>      
            `
        };

        mg.messages().send(data, async function (error) {
            if (error) {
                return res.status(400).json({
                    msg: error.message,
                    status: false,
                });
            }


            return res.status(200).json({
                status: true,
                msg: 'We have sent a 6-digit Verification code to your email address',
                data: { token: token, user: createdUser },
            });



        });


    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            status: false,
            msg: 'Server Error',
        });
    }
};

// @This Block of Code resends a verification otp to the user email address
export const resendVerificationOtp = async (req, res) => {
    try {
        const {
            user: { email },
        } = req;

        User.findOne({ email: email.toLowerCase() })
            .then(async (customer) => {
                if (!customer)
                    return res.status(404).json({
                        msg: 'Invalid email address, this email address does not exist',
                        status: false,
                    });

                const otp = helper.generateOTP();
                const salt = bcrypt.genSaltSync(12);
                const hashedOtp = await bcrypt.hash(String(otp), salt);
                customer.otpToken = hashedOtp;
                customer.isAccountVerified = false;
                customer.isEmailVerified = false;
                customer
                    .save()
                    .then(() => {
                        const mg = mailgun({
                            apiKey: process.env.MAILGUN_API_KEY,
                            domain: DOMAIN,
                        });
                        const data = {
                            from: `${process.env.EMAIL_FROM}`,
                            to: email,
                            subject: 'Ogamoni Account Activation',
                            html: `
                                  <div>
                            <p>
                                Hello there, <br/>
                           </p>
                            <p style="">
                                 Welcome Onboard, we are thrilled to announce that you've successfully created an account on Ogamoni, the Budgeting of
                               funds and payments! 🎉
                            </p>
                            <p>
                              Welcome to Ogamoni <br/> Explore the world of endless possibilities with Ogamoni. <br/>
                              Enter the OTP Verification Code to verify your email address.
                            </p>

                            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
                            Your Verification Code.
                            </h3>
                                <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                                    ${otp}
                                </h1>

                             <p>
                                From the Ogamoni Team.<br/>
                                Join Our Social Media Handles for Updates.
                             </p>


                            <div style="padding:5px 0px; text-align:center; display:flex; flex-direction:column; justify-content:center; ">
                                <div style="padding:2px; ">
                                    <a href="https://www.linkedin.com/company/ogamonihq/" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/linkedin%20(1).png?updatedAt=1698255926190" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://www.instagram.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/instagram%20(1).png?updatedAt=1698255925991" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://twitter.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/twitter%20(1).png?updatedAt=1698255925981" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                            </div>
                            <div style="padding:5px 0px; text-align:center ">
                                <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/ogamoniwhite_bs-qbr_RK.png?updatedAt=1698255468184" alt="ogamoni" height="100px" />
                            </div>

                            <div style="padding:10px 0px 0px 0px; text-align:center;">
                                © Copyright. ogamoni.com
                            </div>
                       </div>             
                        `,
                        };

                        mg.messages().send(data, async function (error) {
                            if (error) {
                                return res.status(400).json({
                                    msg: error.message,
                                    status: false,
                                });
                            }

                            return res.status(200).json({
                                msg: 'We have sent a 6-digit Verification code to your email address',
                                status: true,
                            });
                        });
                    })
                    .catch((err) =>
                        res.status(500).json({ msg: err.message, status: false })
                    );
            })
            .catch((err) => res.status(500).json({ msg: err.message, status: false }));
    }
    catch (err) {
        res.status(500).json({ msg: err.message, status: false });
    }
};

// @THIS Block of Code, verifies and activates the User Email Address
export const activateAccount = async (req, res) => {
    try {
        const { otp } = req.body;
        const {
            user: { email }, // get email from
        } = req;

        const user = await User.findOne({ email: email }).select('-password');
        if (!user) {
            return res.status(400).json({
                msg: 'Something Went Wrong',
                status: false,
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                msg: 'Your Account has been Verified Already',
                status: false,
            });
        }

        const hashedOtp = await bcrypt.compare(String(otp), user.otpToken);

        if (!hashedOtp) {
            return res.status(400).json({
                msg: 'Invalid OTP Verification Code',
                status: false,
            });
        }

        user.otpToken = undefined;
        user.isEmailVerified = true;
        user.isAccountVerified = true;
        await user.save();

        return res.status(200).json({
            msg: 'Email verification successful',
            status: true,
            data: { user },
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            status: false,
            msg: 'Could not verify your email address, contact support if this persist!',
        });
    }
};

// @THIS Block of Code Logs in the user returning his data , token, message and status:true
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid Email or Password Credentials',
                status: false,
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                msg: 'Invalid Email or Password Credentials',
                status: false,
            });
        }

        if (!user.isEmailVerified) {

            const salt = await bcrypt.genSaltSync(12);
            const otp = helper.generateOTP();
            const hashedOtp = await bcrypt.hash(String(otp), salt);

            user.otpToken = hashedOtp;
            user.isEmailVerified = false;
            user.isAccountVerified = false;
            await user.save();


            const mg = mailgun({
                apiKey: process.env.MAILGUN_API_KEY,
                domain: DOMAIN,
            });

            const data = {
                from: `${process.env.EMAIL_FROM}`,
                to: email,
                subject: 'Ogamoni Account Activation',
                html: `
                       <div>
                            <p>
                                Hello there, <br/>
                           </p>
                            <p style="">
                                 Welcome Onboard, we are thrilled to announce that you've successfully created an account on Ogamoni, the Budgeting of
                               funds and payments! 🎉
                            </p>
                            <p>
                              Welcome to Ogamoni <br/> Explore the world of endless possibilities with Ogamoni. <br/>
                              Enter the OTP Verification Code to verify your email address.
                            </p>
                    
                            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
                            Your Verification Code.
                            </h3>
                                <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                                    ${otp}
                                </h1>

                             <p>
                                From the Ogamoni Team.<br/>
                                Join Our Social Media Handles for Updates.
                             </p>


                            <div style="padding:5px 0px; text-align:center; display:flex; flex-direction:column; justify-content:center; ">
                                <div style="padding:2px; ">
                                    <a href="https://www.linkedin.com/company/ogamonihq/" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/linkedin%20(1).png?updatedAt=1698255926190" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://www.instagram.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/instagram%20(1).png?updatedAt=1698255925991" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://twitter.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/twitter%20(1).png?updatedAt=1698255925981" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                            </div>
                            <div style="padding:5px 0px; text-align:center ">
                                <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/ogamoniwhite_bs-qbr_RK.png?updatedAt=1698255468184" alt="ogamoni" height="100px" />
                            </div>

                            <div style="padding:10px 0px 0px 0px; text-align:center;">
                                © Copyright. ogamoni.com
                            </div>
                       </div>      
            `
            };

            mg.messages().send(data, async function (error) {
                if (error) {
                    return res.status(400).json({
                        msg: error.message,
                        status: false,
                    });
                }


                const payload = {
                    user: {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                    },
                };

                const token = jwt.sign(payload, process.env.JWTSECRET, {
                    expiresIn: process.env.JWTLIFETIME,
                });

                return res.status(200).json({
                    msg: 'We have sent a 6-digit Verification code to your email address, Kindly verify your email address to continue',
                    status: true,
                    token
                });
            });

            return;
        }


        const payload = {
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        };

        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: process.env.JWTLIFETIME,
        });

        return res.status(200).json({
            msg: 'Login successful',
            status: true,
            data: { token, user: user },
        });
    } catch (err) {
        return res.status(500).json({
            msg: 'Failed to sign you in, Please contact support if this persist!',
            status: false,
        });
    }
};
// @This Block of Code sends a reset password otp to the user email address
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Enter Email Address',
            });
        }

        User.findOne({ email: email.toLowerCase() })
            .then(async (customer) => {
                if (!customer)
                    return res.status(404).json({
                        msg: 'Invalid email address, this email address does not exist',
                        status: false,
                    });

                const otp = helper.generateOTP();
                const salt = bcrypt.genSaltSync(12);
                const hashedOtp = await bcrypt.hash(String(otp), salt);
                customer.resetPasswordToken = hashedOtp;
                customer.emailResetTokenStatus = false; // set reset password reset status


                const payload = {
                    user: {
                        id: customer._id,
                        firstname: customer.firstname,
                        lastname: customer.lastname,
                        email: customer.email,
                    },
                };

                const token = jwt.sign(payload, process.env.JWTSECRET, {
                    expiresIn: process.env.JWTLIFETIME,
                });

                customer
                    .save()
                    .then(() => {
                        const mg = mailgun({
                            apiKey: process.env.MAILGUN_API_KEY,
                            domain: DOMAIN,
                        });
                        const data = {
                            from: `${process.env.EMAIL_FROM}`,
                            to: email,
                            subject: 'Ogamoni Reset Password ',
                            html: `
                               <div>
                            <p>
                                Hello there, <br/>
                           </p>

                            <p>
                              Welcome to Ogamoni <br/> Explore the world of endless possibilities with Ogamoni. <br/>
                              Enter the Reset Password Verification Code to continue
                            </p>
                    
                            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
                            Your Reset Verification Code.
                            </h3>
                                <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                                    ${otp}
                                </h1>

                             <p>
                                From The Ogamoni Team.<br/>
                                Join Our Social Media Handles for Updates.
                             </p>

                             <div style="padding:5px 0px; text-align:center; display:flex; flex-direction:column; justify-content:center; ">
                                <div style="padding:2px; ">
                                    <a href="https://www.linkedin.com/company/ogamonihq/" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/linkedin%20(1).png?updatedAt=1698255926190" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://www.instagram.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/instagram%20(1).png?updatedAt=1698255925991" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://twitter.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/twitter%20(1).png?updatedAt=1698255925981" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                            </div>
                            <div style="padding:5px 0px; text-align:center ">
                                <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/ogamoniwhite_bs-qbr_RK.png?updatedAt=1698255468184" alt="ogamoni" height="100px" />
                            </div>

                            <div style="padding:10px 0px 0px 0px; text-align:center;">
                                © Copyright. ogamoni.com
                            </div>


                       </div>         
                        `,
                        };

                        mg.messages().send(data, async function (error) {
                            if (error) {
                                return res.status(400).json({
                                    msg: error.message,
                                    status: false,

                                });
                            }

                            return res.status(200).json({
                                msg: 'We have sent a 6-digit reset code to your email address',
                                status: true,
                                data: { token },
                            });
                        });
                    })
                    .catch((err) =>
                        res.status(500).json({ msg: err.message, status: false })
                    );
            })
            .catch((err) => res.status(500).json({ msg: err.message, status: false }));

    } catch (err) {
        res.status(500).json({ msg: err.message, status: false });
    }
};
// @This Block of Code verifies the otp sent to the user email address
export const reset = async (req, res) => {
    try {
        const { otp } = req.body;
        const {
            user: { email },
        } = req;

        const user = await User.findOne({ email: email.toLowerCase() });
        const hashedOtp = await bcrypt.compare(
            String(otp),
            user.resetPasswordToken
        );
        if (!user) {
            return res.status(404).json({
                msg: 'Invalid Email Addresss',
                status: false,
            });
        }

        if (!hashedOtp) {
            return res.status(400).json({
                msg: 'Invalid OTP Verification Code',
                status: false,
            });
        }

        user.emailResetTokenStatus = true;
        await user.save();

        return res.status(200).json({
            msg: 'Verification Successful',
            status: true,
            data: {
                token: user.resetPasswordToken,
            },
        });
    } catch (err) {
        res.status(500).json({ msg: err.message, status: false });
    }
};
// @This Block of Code resets the user password
export const resetPassword = async (req, res) => {
    try {

        const { password, email } = req.body;

        const salt = await bcrypt.genSaltSync(12);
        const hashpassword = await bcrypt.hash(password, salt);
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid Email Address',
                status: false,
            });
        }

        // check if emailResetTokenStatus is true...
        if (!user.emailResetTokenStatus) {
            return res.status(400).json({
                msg: 'Failed to reset your password!',
                status: false,
            });
        }

        user.password = hashpassword;
        user.emailResetTokenStatus = undefined;
        user.resetPasswordToken = undefined;

        await user.save();

        return res
            .status(200)
            .json({ msg: 'Password updated successfully!', status: true });

    } catch (err) {
        res.status(500).json({ msg: err.message, status: false });
    }
};

// @This Block of Code resends a reset password otp to the user email address
export const resendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Enter Email Address',
            });
        }

        User.findOne({ email: email.toLowerCase() })
            .then(async (customer) => {
                if (!customer)
                    return res.status(404).json({
                        msg: 'Invalid email address, this email address does not exist',
                        status: false,
                    });

                const otp = helper.generateOTP();
                const salt = bcrypt.genSaltSync(12);
                const hashedOtp = await bcrypt.hash(String(otp), salt);
                customer.resetPasswordToken = hashedOtp;
                customer.emailResetTokenStatus = false; // set reset password reset status

                const payload = {
                    user: {
                        id: customer._id,
                        firstname: customer.firstname,
                        lastname: customer.lastname,
                        email: customer.email,
                    },
                };

                const token = jwt.sign(payload, process.env.JWTSECRET, {
                    expiresIn: process.env.JWTLIFETIME,
                });

                customer
                    .save()
                    .then(() => {
                        const mg = mailgun({
                            apiKey: process.env.MAILGUN_API_KEY,
                            domain: DOMAIN,
                        });
                        const data = {
                            from: `${process.env.EMAIL_FROM}`,
                            to: email,
                            subject: 'Ogamoni Reset Password',
                            html: `
                             <div>
                            <p>
                                Hello there, <br/>
                           </p>

                            <p>
                              Welcome to Ogamoni <br/> Explore the world of endless possibilities with Ogamoni. <br/>
                              Enter the Reset Password Verification Code to continue
                            </p>

                            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
                            Your Reset Verification Code.
                            </h3>
                                <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                                    ${otp}
                                </h1>

                             <p>
                                From The Ogamoni Team.<br/>
                                Join Our Social Media Handles for Updates.
                             </p>

                             <div style="padding:5px 0px; text-align:center; display:flex; flex-direction:column; justify-content:center; ">
                                <div style="padding:2px; ">
                                    <a href="https://www.linkedin.com/company/ogamonihq/" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/linkedin%20(1).png?updatedAt=1698255926190" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://www.instagram.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/instagram%20(1).png?updatedAt=1698255925991" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                                <div style="padding:2px; ">
                                    <a href="https://twitter.com/ogamonihq" target="_blank" style="padding:1px; ">
                                      <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/twitter%20(1).png?updatedAt=1698255925981" alt="usekowe" height="30px" />
                                    </a>
                                </div>
                            </div>
                            <div style="padding:5px 0px; text-align:center ">
                                <img src="https://ik.imagekit.io/2cgacn5uv/ogamoni-images/ogamoniwhite_bs-qbr_RK.png?updatedAt=1698255468184" alt="ogamoni" height="100px" />
                            </div>

                            <div style="padding:10px 0px 0px 0px; text-align:center;">
                                © Copyright. ogamoni.com
                            </div>


                       </div>         
                        `,
                        };

                        mg.messages().send(data, async function (error) {
                            if (error) {
                                return res.status(400).json({
                                    msg: error.message,
                                    status: false,
                                });
                            }

                            return res.status(200).json({
                                msg: 'We have sent a 6-digit reset code to your email address',
                                status: true,
                                data: { token },
                            });
                        });
                    })
                    .catch((err) =>
                        res.status(500).json({ msg: err.message, status: false })
                    );
            })
            .catch((err) => res.status(500).json({ msg: err.message, status: false }));
    }
    catch (err) {
        res.status(500).json({ msg: err.message, status: false });
    }
};

// @THIS Block of Code Logs refreshes the users data , returns same data, new token and status:true
export const refreshUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(400).json({
                msg: 'Invalid Authorization',
                status: false,
            });
        }

        const payload = {
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        };
        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: process.env.JWTLIFETIME,
        });
        return res.status(200).json({
            status: true,
            data: { token, user },
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            msg: 'Server Error',
            status: false,
        });
    }
};



