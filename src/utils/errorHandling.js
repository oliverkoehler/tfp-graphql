// const Sentry = require('@sentry/node');

exports.handleError = (err, data = null, throwError = false) => {
  console.log(err.message);
  // const errorToHandle = new Error(err.message);
  return {
    code: 1,
    msg: 'something went wrong'
  }
  /*Sentry.configureScope(function (scope) {
    scope.setExtra('data', data);
    Sentry.captureException(errorToHandle);
  });*/
  if (throwError) throw errorToHandle;
};
