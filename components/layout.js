
'use client';

import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import { AuthProvider } from '../components/AuthProvider';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ApolloProvider client={client}>
            {children}
          </ApolloProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
