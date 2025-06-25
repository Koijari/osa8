import { gql } from '@apollo/client';

const AUTHOR = gql`
  fragment AuthorDetails on Author {
    name
    born
    bookCount
  }
`;

export const ALL_AUTHORS = gql`
  query {
      allAuthors {
      ...AuthorDetails
      }
  }
  ${AUTHOR}
`;

export const ALL_BOOKS = gql`
  query  allBooks($genre: String) {
    allBooks (genre: $genre) {
      id
      title
      author {
        name
      }
      genres
      published
      id
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $born: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $born
    ) {
      name
      born
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      id
      title
      author {
        name
      }
      genres
      published
    }
  }
`;