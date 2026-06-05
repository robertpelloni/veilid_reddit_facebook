import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ProfileContainer } from './components/ProfileContainer';
import { FeedAggregator } from './services/aggregator';

const aggregator = new FeedAggregator();

const App = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

  useEffect(() => {
    aggregator.fetchFeed().then(setFeed);
  }, []);

  const handleSubscribe = () => {
    aggregator.subscribe(newKey);
    setNewKey('');
    aggregator.fetchFeed().then(setFeed);
  };

  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setFeedbackStatus('Feedback sent successfully! (Simulated)');
    setFeedback('');
    setTimeout(() => setFeedbackStatus(''), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans bg-white min-h-screen">
      <header className="mb-10 border-b pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Veilid Reddit MySpace</h1>
        <p className="text-gray-600 mt-2">Decentralized, Serverless, Sovereign Social Fabric</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Home Feed</h2>
            <div className="space-y-4">
              {feed.length > 0 ? feed.map(post => (
                <div key={post.post_id} className="p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white">
                  <h3 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">By: <span className="font-mono">{post.author_id}</span> • {new Date(post.timestamp).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-gray-500 italic">Your feed is empty. Subscribe to some keys!</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile Preview</h2>
            <div className="border rounded-xl overflow-hidden shadow-inner bg-gray-50">
              <ProfileContainer
                cssStyles={`body { background: #e9ebee; margin: 0; padding: 20px; font-family: sans-serif; } #myspace-subreddit-root { background: white; padding: 30px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; } h1 { color: #3b5998; border-bottom: 1px solid #ddd; padding-bottom: 10px; } p { line-height: 1.6; color: #333; }`}
                htmlContent={`<h1>Bob's Sovereign Profile</h1><p>I own my data. No central server. No trackers. Just P2P.</p><div style="background: #f6f7f9; padding: 15px; margin-top: 20px; border: 1px solid #ddd;"><strong>Current Status:</strong> Building the decentralized future.</div>`}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-bold mb-3 text-blue-900">Subscribe</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Veilid DHT Key"
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <button
                onClick={handleSubscribe}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:transform active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                Join Subreddit
              </button>
            </div>
          </section>

          <section className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Submit Feedback</h2>
            <div className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What do you think?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm h-32 resize-none"
              />
              <button
                onClick={handleFeedbackSubmit}
                className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 active:transform active:scale-95 transition-all"
              >
                Send Feedback
              </button>
              {feedbackStatus && <p className="text-xs text-green-600 font-medium text-center">{feedbackStatus}</p>}
            </div>
          </section>
        </aside>
      </main>

      <footer className="mt-20 border-t pt-8 text-center text-gray-400 text-sm">
        <p>© 2024 Veilid Reddit MySpace • Built on Autopilot</p>
      </footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
