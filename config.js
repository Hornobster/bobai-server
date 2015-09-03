/**
 * Created by carlovespa on 04/02/15.
 */

module.exports = {
    tokenInfo: {
        tokenDuration: 7, // in days
        jwtSecret: process.env.JWT_SECRET
    },
    adsInfo: {
        titleMaxLength: 100,
        descriptionMaxLength: 250,
        maxDuration: 48 // in hours
    },
    geo: {
        lonLatDBScale: 10000
    },
    serverInfo: {
        defaultPort: 3000
    },
    awsInfo: {
        accessKeyID: process.env.AWS_ACCESS_KEY_ID,
        accessKeySecret: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.S3_BUCKET_NAME
    },
    statusMessages: {
        tokenExpired: 'Token expired',
        tokenInvalid: 'Invalid token',
        tokenOrKeyInvalid: 'Invalid token or key',
        unauthorized: 'Unauthorized access',
        logoutSuccess: 'Logout successful',
        logoutFail: 'Logout failed',
        credentialsInvalid: 'Invalid credentials',
        internalError: 'Oops something went wrong!',
        dataInvalid: 'Invalid data',
        adPostSuccess: 'Ad created successfully!',
        proposalPostSuccess: 'Proposal created successfully!',
        messagePostSuccess: 'Message sent successfully!',
        userSignupSuccess: 'User successfully registered',
        alreadyInUse: 'Username, email or phone number already in use!'
    }
};
