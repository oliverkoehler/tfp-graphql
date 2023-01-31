const jwt = require('jsonwebtoken');
const moment = require('moment');

const Token = require('../models/Token');

const auth = async ({ req }) => {
  const publicEndpoints = ['loginUser', 'createUser'];

  try {
    let performCheck = true;

    if (process.env.APP_ENV !== 'production') {
      performCheck = false;
    }

    if (req.body.query) {
      for (let i = 0; i < publicEndpoints.length; i++) {
        if (req.body.query.indexOf(publicEndpoints[i]) !== -1) {
          performCheck = false;
        }
      }
    }

    if (performCheck) {
      if (!req.header('Authorization')) {
        throw new Error('No authorization header present!');
      }

      if (req.header('Authorization').includes('null')) {
        throw new Error('No authorized token!');
      }

      const token = req.header('Authorization').replace('Bearer ', '');

      if (process.env.JWT_APP_TOKEN !== token) {
        const data = await jwt.verify(token, process.env.JWT_KEY);
        const userToken = await Token.findOne(
          {
            user: data._id,
            token,
          },
          {
            _id: 1,
            user: 1,
            usage: 1,
          },
        ).populate('user');

        if (!userToken) {
          throw new Error('Not authorized');
        }

        if (!userToken.user) {
          throw new Error('No user object found!');
        }

        const dateForCheck = moment.utc().startOf('day');
        const dateDiff = moment.utc(userToken.usage);

        if (dateForCheck.diff(dateDiff, 'minutes') > 0) {
          await userToken.updateOne({
            $set: {
              usage: dateForCheck,
            },
            $addToSet: {
              history: dateForCheck,
            },
          });
        }

        return {
          user: userToken.user,
          token,
        };
      }
      throw new Error('Not allowed');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Generic error');
  }
};

module.exports = auth;
