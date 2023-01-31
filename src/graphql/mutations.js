const ErrorHandling = require('../utils/errorHandling');

const UserService = require('../services/user');

const mutations = {
  createUser: (_, { name, email, password }) => {
    if (!name || !email || !password)
      ErrorHandling.handleError('No name, email or password is given', {
        name,
        email,
        password,
      });

    return UserService.createUser(name, email, password);
  },
  loginUser: (_, { name, password, platform }) => {
    return UserService.loginUser(name, password, platform);
  },
};

module.exports = mutations;
