import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';

const cache = new InMemoryCache();
const link = new HttpLink({ uri: '/graphql' });

export const apolloClient = new ApolloClient({ cache, link });
