const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Token = require('../models/Token');
const ErrorHandling = require('../utils/errorHandling');

exports.getUsers = (pagination, sorting, filter) => {
  const filters = {};

  if (filter && filter.q) {
    filters.name = {
      $regex: '.*' + filter.q + '.*',
      $options: 'si',
    };
  }

  const userQuery = User.find(filters)
    .limit(pagination.perPage)
    .skip((pagination.page - 1) * pagination.perPage);

  if (sorting) {
    const sortingObj = {};
    sortingObj[sorting.field] = sorting.order === 'DESC' ? -1 : 1;
    userQuery.sort(sortingObj);
  }

  return userQuery
    .lean()
    .exec()
    .catch((err) =>
      ErrorHandling.handleError(err, {
        method: 'getUsers',
        pagination,
        sorting,
        filter,
      }),
    );
};

exports.loginUser = async (name, password, platform) => {
  const user = await User.findOne({ name }).exec();

  if (!user)
    return {
      success: false,
      code: 1, // No user found
      msg: 'No user found :('
    };

  

  if (!(await bcrypt.compare(password, user.password))) {
    user.wrongLoginCount += 1;
    if (user.wrongLoginCount === 3) {
      user.wrongLoginCount = 0;
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
      const randomPassword = await bcrypt.hash(randomstring.generate(7), salt);
      // TODO: send email with new password
      user.password = randomPassword;
      return {
        success: false,
        msg: 'Credentials incorrect. New password sent!',
        code: 5, // Password incorrect again and new password send
      };
    }
    await user.save();
    return {
      success: false,
      msg: 'Credentials incorrect.',
      code: 2, // Password incorrect
    };
  }

  
  if (user.isBanned === true)
    return {
      success: false,
      code: 3, // User is banned
    };
  if (!user.isActivated)
    return {
      success: false,
      code: 4, // User is not activated yet
    };

  if (user.wrongLoginCount > 0) {
    user.wrongLoginCount = 0;
    await user.save();
  }



  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);

  await Token.create({
    user: user._id,
    token,
    platform,
  });

  return {
    success: true,
    code: null,
    msg: token,
  };
};

exports.createUser = async (name, email, password) => {
  if (!validator.isLength(name, { min: 4, max: 30 }))
    return {
      success: false,
      msg: 'Name must be between 4 and 30 characters.',
      code: 1, // Username min 4 max 30
    };

  if (!validator.isAlphanumeric(name))
    return {
      success: false,
      msg: 'Special characters not allowed.',
      code: 2, // Not valid name
    };

  if (!validator.isEmail(email))
    return {
      success: false,
      msg: 'No valid email.',
      code: 3, // Not valid email
    };

  if (!validator.isLength(password, { min: 6, max: 30 }))
    return {
      success: false,
      msg: 'Passwort must be between 4 and 30 characters.',
      code: 4, // Password min 6 max 30
    };

  const existsUser = await User.countDocuments({ name });

  if (existsUser)
    return {
      success: false,
      msg: 'User already exists',
      code: 5, // User already exists
    };

  const existsEmail = await User.countDocuments({ email });

  if (existsEmail)
    return {
      success: false,
      msg: 'Email already taken.',
      code: 6, // Email already exists
    };

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
  const pwd = await bcrypt.hash(password, salt);
  const activationKey = randomstring.generate();

  // TODO: Send email with activation key

  const user = await User.create({
    name,
    email,
    password: pwd,
    activationKey,
    isActivated: true // TODO: Implement activation process
  }).catch((err) =>
    ErrorHandling.handleError(err, {
      method: 'createUser',
      name,
      email,
    }),
  );

  return {
    success: !!user,
    code: null,
  };
};

exports.activateUser = async (key) => {
  const user = await User.findOne({ activationKey: key });

  if (!user)
    ErrorHandling.handleError('User not exists', {
      method: 'activateUser',
      key,
    });

  if (user.isActivated)
    ErrorHandling.handleError('User is already activated', {
      method: 'activateUser',
      key,
    });

  user.isActivated = true;
  await user.save();

  // TODO: Send email with activated user

  return true;
};
