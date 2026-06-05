import React from 'react';

interface ProfileProps {
  cssStyles: string;
  htmlContent: string;
}

export const ProfileContainer: React.FC<ProfileProps> = ({ cssStyles, htmlContent }) => {
  const completeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${cssStyles}
        </style>
      </head>
      <body>
        <div id="myspace-subreddit-root">
          ${htmlContent}
        </div>
      </body>
    </html>
  `;

  return (
    <iframe
      srcDoc={completeHTML}
      className="w-full h-screen border-none"
      sandbox=""
      title="Sovereign Subreddit Sandbox"
    />
  );
};
