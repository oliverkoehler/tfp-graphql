const defaultPagination = '{ perPage: 50, page: 1 }';

const typeDefs = `
  scalar Date

  input Pagination {
    page: Int
    perPage: Int
  }
  
  input Filter {
    q: String
  }
  
  input Sorting {
    field: String!
    order: String!
  }

  type SuccessErrorResponse {
    success: Boolean
    code: Int
    msg: String
  }
  
  type User {
    _id: ID!
    name: String!
    email: String!
    activationKey: String
    password: String
    newsletterActivated: Boolean
    isBanned: Boolean
    isActivated: Boolean
    languages: [String]
    wrongLoginCount: Int
    community: ID
    deleted: Boolean
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
  }
  
  type Query {
    users(sorting: Sorting, pagination: Pagination = ${defaultPagination}, filter: Filter): [User]
    myUser: User
  }
  
  type Mutation {
    createUser(name: String!, email: String!, password: String!): SuccessErrorResponse
    loginUser(name: String!, password: String!, platform: String!): SuccessErrorResponse
  }
`;

module.exports = typeDefs;
