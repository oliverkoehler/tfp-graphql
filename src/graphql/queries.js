const ErrorHandling = require('../utils/errorHandling');

const UserService = require('../services/user');

const queries = {
  users: (_, { sorting, pagination, filter }) => {
    return UserService.getUsers(pagination, sorting, filter);
  },
  myUser: (_, args, context) => {
    if (!context.user)
      ErrorHandling.handleError('No user context', {
        method: 'myUser',
        context,
      });

    return context.user;
  },
};

module.exports = queries;
