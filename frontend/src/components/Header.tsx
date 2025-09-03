import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{ 
      background: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            Smart ToDo
          </h1>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            AI-Powered Task Management
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;