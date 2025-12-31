import React from 'react';
import ReactDOM from 'react-dom/client';

/* 🔥 AntD styles FIRST */
import "antd/dist/reset.css";

/* Your global styles AFTER */
import './index.css';

import App from './App';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './config/apollo';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
