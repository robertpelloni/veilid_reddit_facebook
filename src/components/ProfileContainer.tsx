import React, { useEffect, useRef } from 'react';

interface ProfileProps {
  cssStyles: string;
  htmlContent: string;
}

export const ProfileContainer: React.FC<ProfileProps> = ({ cssStyles, htmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const completeHTML = `
      <html>
        <head>
          <style>${cssStyles}</style>
        </head>
        <body>
          <div id="myspace-subreddit-root">${htmlContent}</div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(completeHTML);
    doc.close();
  }, [cssStyles, htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-screen border-none"
      sandbox=""
      title="Sovereign Subreddit Sandbox"
    />
  );
};
