
'use client';

import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import { AuthProvider } from '../components/AuthProvider';
import AppContent from '../components/AppContent';

export default function Home() {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <AppContent />
      </ApolloProvider>
    </AuthProvider>
  );
}