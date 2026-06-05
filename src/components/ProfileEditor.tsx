import React, { useState } from 'react';

interface ProfileEditorProps {
  onSave: (username: string, css: string, html: string) => void;
  isSaving: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave, isSaving }) => {
  const [username, setUsername] = useState('');
  const [cssStyles, setCssStyles] = useState(`body { background: #e9ebee; margin: 0; padding: 20px; font-family: sans-serif; } #myspace-subreddit-root { background: white; padding: 30px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; } h1 { color: #3b5998; border-bottom: 1px solid #ddd; padding-bottom: 10px; } p { line-height: 1.6; color: #333; }`);
  const [htmlContent, setHtmlContent] = useState(`<h1>My Sovereign Profile</h1><p>Welcome to my decentralised space.</p>`);

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Edit Your Sovereign Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Satoshi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
          <textarea
            value={cssStyles}
            onChange={(e) => setCssStyles(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom HTML Content</label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs h-32"
          />
        </div>

        <button
          onClick={() => onSave(username, cssStyles, htmlContent)}
          disabled={isSaving}
          className={`w-full py-3 ${isSaving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-bold rounded-lg transition-all shadow-lg shadow-green-100`}
        >
          {isSaving ? 'Publishing to Veilid...' : 'Publish Profile'}
        </button>
      </div>
    </div>
  );
};
