const mongoose = require('mongoose');

const ErrorHandling = require('./errorHandling');

exports.connectToDatabase = async () => {
  try {
    const poolSize = process.env.POOL_SIZE ? process.env.POOL_SIZE : 20;

    // Set database authentication on production environment
    const dbAuth =
      process.env.APP_ENV === 'production'
        ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@'
        : process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@';

    // Set up default mongoose connection
    let url =
      process.env.DB_CONNECTION +
      '://' +
      dbAuth +
      process.env.DB_HOST +
      '/' +
      process.env.DB_DATABASE;

    if (process.env.APP_ENV === 'production')
      url += '?retryWrites=true&w=majority';

    await mongoose.connect(url, {
      useNewUrlParser: true, // Suppress deprecation
      useUnifiedTopology: true, // Suppress deprecation. Note having it true doesn't make any difference.
      useFindAndModify: false, // Suppress deprecation
      autoIndex: false,
      bufferMaxEntries: false,
      poolSize: poolSize, // Maintain up to 20 socket connection
    });

    const db = mongoose.connection;

    db.on('connection', (stream) => {
      console.log('connected');
    });

    // Bind connection to error event (to get notification of connection errors)
    db.on('error', (err) => {
      console.log('error...trying to reconnect', err);
      this.connectToDatabase();
    });
    db.on('disconnected', (err) => {
      console.log('disconnected...trying to reconnect', err);
      this.connectToDatabase();
    });
  } catch (error) {
    ErrorHandling.handleError(
      `Mongoose database connection failed with error: ${error}`,
      {
        method: 'connectToDatabase',
      },
      false,
    );
  }
};
