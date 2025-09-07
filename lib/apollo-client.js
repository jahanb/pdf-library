
'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api/graphql'
    : 'http://localhost:3000/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Handle authentication errors
      if (message.includes('Authentication') || message.includes('token')) {
        console.log('Authentication error detected, clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Optionally reload the page to reset auth state
          window.location.reload();
        }
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
  ssrMode: typeof window === 'undefined',
});

export default client;
