const { createServer } = require('@graphql-yoga/node');
const { resolvers } = require('./resolvers');
const typeDefs = require('./schema/schema');
const { verifyToken } = require('./auth/auth');
require('dotenv').config();

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  context: (req) => {
    const token = req.request.headers.get('authorization') || '';
    let user = null;
    
    if (token) {
      try {
        user = verifyToken(token.replace('Bearer ', ''));
      } catch (error) {
        user = null;
      }
    }
    
    return { user };
  },
  cors: {
    origin: '*',
    credentials: true,
  },
});

server.start().then(() => {
  console.log(`🚀 Server running on http://localhost:4000`);
});