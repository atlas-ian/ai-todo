import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;