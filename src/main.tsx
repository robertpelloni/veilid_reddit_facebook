import React from 'react';
import ReactDOM from 'react-dom/client';
import { ProfileContainer } from './components/ProfileContainer';

const App = () => {
  const mockProfile = {
    cssStyles: `
      body { background-color: #000; color: #0f0; font-family: 'Courier New', Courier, monospace; }
      #myspace-subreddit-root { padding: 20px; border: 2px solid #0f0; }
      h1 { color: #f0f; text-shadow: 2px 2px #fff; }
    `,
    htmlContent: `
      <h1>Welcome to Bob's Sovereign Subreddit</h1>
      <p>This is a decentralized MySpace-style profile page built on Veilid.</p>
      <div style="margin-top: 20px;">
        <h3>Top 8 Friends</h3>
        <ul>
          <li>Alice</li>
          <li>Charlie</li>
          <li>Dave</li>
        </ul>
      </div>
    `
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#333' }}>Veilid Reddit MySpace Explorer</h2>
      <ProfileContainer cssStyles={mockProfile.cssStyles} htmlContent={mockProfile.htmlContent} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
