import React from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Dashboard />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;