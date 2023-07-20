const jwt= require('jsonwebtoken');
function generateToken(userInfo){
    if (!userInfo){
        return null;
    }

    return jwt.sign(userInfo, process.env.JWT_SECRET,{
        expiresIn: '1h'
    });
}


async function verifyToken(email, token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, response) => {
            if (error) {
                resolve({
                    verified: false,
                    message: 'invalid token'
                });
            } else if (response.email !== email) {
                resolve({
                    verified: false,
                    message: 'invalid user'
                });
            } else {
                resolve({
                    verified: true,
                    message: 'verified',
                    email: email
                });
            }
        });
    });
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
