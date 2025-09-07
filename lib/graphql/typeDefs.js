
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    description: String
    fileName: String!
    fileSize: Int!
    uploadDate: String!
    createdAt: String!
    updatedAt: String!
  }

  input BookInput {
    title: String!
    author: String!
    description: String
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    searchBooks(query: String!): [Book!]!
  }

  type Mutation {
    deleteBook(id: ID!): Boolean!
    updateBook(id: ID!, input: BookInput!): Book!
  }
`;
