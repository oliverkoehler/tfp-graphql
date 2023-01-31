const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const queries = require('./queries');
const mutations = require('./mutations');

const resolvers = {
  Query: queries,
  Mutation: mutations,
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
};

module.exports = resolvers;
