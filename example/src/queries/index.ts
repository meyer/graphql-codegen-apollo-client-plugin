/* eslint-disable */
import gql from 'graphql-tag';
import { MutationOptions, QueryOptions } from 'apollo-client';
import { apolloClient } from '../apolloClient';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  goodbye?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  time: Scalars['String'];
  sayHello: Scalars['String'];
};

export type QuerySayHelloArgs = {
  name?: Maybe<Scalars['String']>;
};

export type GoodbyeMutationVariables = {};

export type GoodbyeMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'goodbye'>;

export type HelloQueryVariables = {
  name?: Maybe<Scalars['String']>;
};

export type HelloQuery = { __typename?: 'Query' } & Pick<Query, 'sayHello'>;

export type Hello2QueryVariables = {};

export type Hello2Query = { __typename?: 'Query' } & Pick<Query, 'sayHello'>;

export const GoodbyeDocument = gql`
  mutation goodbye {
    goodbye
  }
`;

export const goodbye = (
  options?: Omit<MutationOptions<GoodbyeMutation, GoodbyeMutationVariables>, 'mutation' | 'variables'>
) => {
  return apolloClient.mutate<GoodbyeMutation, GoodbyeMutationVariables>({
    ...options,
    mutation: GoodbyeDocument,
  });
};
export const HelloDocument = gql`
  query hello($name: String) {
    sayHello(name: $name)
  }
`;

export const hello = (
  variables: HelloQueryVariables,
  options?: Omit<QueryOptions<HelloQueryVariables>, 'query' | 'variables'>
) => {
  return apolloClient.query<HelloQuery, HelloQueryVariables>({
    ...options,
    query: HelloDocument,
    variables,
  });
};
export const Hello2Document = gql`
  query hello2 {
    sayHello(name: "example")
  }
`;

export const hello2 = (options?: Omit<QueryOptions<Hello2QueryVariables>, 'query' | 'variables'>) => {
  return apolloClient.query<Hello2Query, Hello2QueryVariables>({
    ...options,
    query: Hello2Document,
  });
};
