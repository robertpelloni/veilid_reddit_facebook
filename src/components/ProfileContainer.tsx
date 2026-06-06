import React from 'react';

interface ProfileProps {
  cssStyles: string;
  htmlContent: string;
}

export const ProfileContainer: React.FC<ProfileProps> = ({ cssStyles, htmlContent }) => {
  // Superior Intelligence: Proactively strip tracking and external resource calls
  const sanitize = (str: string) => {
    return str
        .replace(/url\(['"]?http[^'"]+['"]?\)/gi, 'url(about:blank)') // Strip external CSS images
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip scripts just in case
        .replace(/on\w+="[^"]*"/gi, ''); // Strip inline event handlers
  };

  const cleanCSS = sanitize(cssStyles);
  const cleanHTML = sanitize(htmlContent);

  const completeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${cleanCSS}
          /* Midnight Stealth Base Styles */
          body { color: #f1f5f9; }
          a { color: #818cf8; }
        </style>
      </head>
      <body style="background: transparent;">
        <div id="myspace-subreddit-root">
          ${cleanHTML}
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
