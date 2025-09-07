
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '../../../lib/graphql/typeDefs';
import { resolvers } from '../../../lib/graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res }),
});

export async function GET(request) {
  return handler(request);
}

export async function POST(request) {
  return handler(request);
}
