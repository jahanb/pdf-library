import { gql } from '@apollo/client';

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      description
      fileName
      fileSize
      uploadDate
      createdAt
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      author
      description
      fileName
      fileSize
      uploadDate
      createdAt
    }
  }
`;

export const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    searchBooks(query: $query) {
      id
      title
      author
      description
      fileName
      fileSize
      uploadDate
      createdAt
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: BookInput!) {
    updateBook(id: $id, input: $input) {
      id
      title
      author
      description
      fileName
      fileSize
      uploadDate
      createdAt
    }
  }
`;