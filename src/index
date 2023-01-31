const { ApolloServer } = require('apollo-server-lambda');
import https from 'https'
const dotenv = require('dotenv');
// const simpleNodeLogger = require('simple-node-logger');

const auth = require('./middleware/authentification');
const functions = require('./utils/functions');

dotenv.config();

//create a rolling file logger based on date/time that fires process events
/*const opts = {
  errorEventName: 'error',
  logDirectory: './logs', // NOTE: folder must exist and be writable...
  fileNamePattern: 'roll-<DATE>.log',
  dateFormat: 'YYYY.MM.DD',
};*/
// global.log = simpleNodeLogger.createRollingFileLogger(opts);

// Get the default connection
functions.connectToDatabase();

const port = process.env.APP_PORT;

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const tracing = true,
  debug = true;

const apolloServer = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  mocks: true,
  context: auth,
  introspection: true,
  tracing, // only true for local development
  playground: false,
  debug,
});

exports.handler = apolloServer.createHandler();

// apolloServer.listen({ port }).then(({ url, server }) => {
//   /*server.keepAliveTimeout = 65000;
//   server.headersTimeout = 66000;*/
//   console.log(`🚀 Server ready at ${url}`);
// });
