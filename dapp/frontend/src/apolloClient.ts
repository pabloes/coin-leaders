// src/apolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
const uri = import.meta.env.THE_GRAPH_URL;
console.log("apollo uri" , uri);
const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
});

export default client;
