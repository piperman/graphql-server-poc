import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
// import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { readFileSync } from 'fs';
import { OrderAPI } from './datasources/order-api.js';
import { UserAPI } from './datasources/user-api.js';
import resolvers from './resolvers/index.js';
import { IncomingHttpHeaders } from 'http';
import cluster from 'cluster';
import os from 'node:os';

function init() {
    if (cluster.isPrimary) {
        let numCPUs = os.cpus().length;
        console.log(" Num of CPU ", numCPUs);
        for (let idx = 0; idx < numCPUs; idx++) {
            cluster.fork();
        }
    } else {
        startServer();
    }
}
// Resolvers define how to fetch the types defined in your schema.
// @ts-ignore
export interface ContextValue {
    dataSources: {
        orderAPI: OrderAPI;
        userAPI: UserAPI;
    };
    headers: IncomingHttpHeaders;
    // apikey: string;
}

async function startServer() {
    // A schema is a collection of type definitions (hence "typeDefs")
    // that together define the "shape" of queries that are executed against
    // your data.
    const typeDefs = readFileSync('./schemas/schema.graphql', { encoding: 'utf-8' });


    // const resolvers = { queries }
    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer<ContextValue>({
        typeDefs,
        resolvers,
        plugins: [responseCachePlugin(),],
        cache: new InMemoryLRUCache(),
    });

    // Passing an ApolloServer instance to the `startStandaloneServer` function:
    //  1. creates an Express app
    //  2. installs your ApolloServer instance as middleware
    //  3. prepares your app to handle incoming requests
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
            const { cache } = server;
            const headers = req.headers;
            return {
                dataSources: {
                    userAPI: new UserAPI({ headers, cache }),
                    orderAPI: new OrderAPI({ cache }),
                },
                headers,
                // apikey,
            };
        },
        listen: { port: 4000 },
    });

    console.log(`🚀  Server ready at: ${url}`);
}
init();