import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface ProfileEditorProps {
  onSave: (username: string, css: string, html: string) => void;
  isSaving: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave, isSaving }) => {
  const [username, setUsername] = useState('');
  const [cssStyles, setCssStyles] = useState(`body { background: #e9ebee; margin: 0; padding: 20px; font-family: sans-serif; } #myspace-subreddit-root { background: white; padding: 30px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; } h1 { color: #3b5998; border-bottom: 1px solid #ddd; padding-bottom: 10px; } p { line-height: 1.6; color: #333; }`);
  const [htmlContent, setHtmlContent] = useState(`<h1>My Sovereign Profile</h1><p>Welcome to my decentralised space.</p>`);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const response = await fetch('http://127.0.0.1:1337/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64_data: base64Data })
        });

        if (response.ok) {
          const { url } = await response.json();
          // Insert the URL into the CSS field for easy copying/use
          setCssStyles((prev) => `/* Uploaded Media: ${url} */\n` + prev);
        } else {
          console.error("Upload failed.");
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Edit Your Sovereign Profile</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Satoshi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cursor-help" title="Mock IPFS/Hypercore hook for Encrypted Media Storage prototype.">Upload Media Asset</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center text-sm text-gray-500">
              <UploadCloud className="mb-2 text-indigo-500" size={24} />
              {isUploading ? <span className="animate-pulse font-medium text-indigo-600">Uploading to IPFS Proxy...</span> : <span>Click or drag image to upload to P2P Media Store</span>}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="css" className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
          <textarea
            id="css"
            value={cssStyles}
            onChange={(e) => setCssStyles(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs h-32"
          />
        </div>

        <div>
          <label htmlFor="html" className="block text-sm font-medium text-gray-700 mb-1">Custom HTML Content</label>
          <textarea
            id="html"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs h-32"
          />
        </div>

        <button
          onClick={() => onSave(username, cssStyles, htmlContent)}
          disabled={isSaving}
          className={`w-full py-3 ${isSaving ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100`}
        >
          {isSaving ? 'Propagating via Onion...' : 'Publish Sovereign Space'}
        </button>
        <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-500 font-mono leading-relaxed">
            <span className="text-indigo-400 font-bold uppercase mr-2">Stealth Intelligence:</span>
            Your profile will be fragmented into 64KB blocks and distributed across the DHT. All external resource calls are proactively stripped to prevent IP leakage to trackers.
        </div>
      </div>
    </div>
  );
};
