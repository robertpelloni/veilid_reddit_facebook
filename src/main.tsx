import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ProfileContainer } from './components/ProfileContainer';
import { ProfileEditor } from './components/ProfileEditor';
import { NetworkStatus } from './components/NetworkStatus';
import { FeedAggregator } from './services/aggregator';
import { DAOProposalList, DAOProposal } from './components/DAO/DAOProposalList';
import { DAOProposalForm } from './components/DAO/DAOProposalForm';
import { CommentThread } from './components/CommentThread';
import { Gavel, Plus, LogOut, Skull } from 'lucide-react';
import { IdentityVault, SovereignIdentity } from './services/identity';
import { SovereignOnboarding } from './components/SovereignOnboarding';

const aggregator = new FeedAggregator();

const App = () => {
  const [identity, setIdentity] = useState<SovereignIdentity | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [discoveredKeys, setDiscoveredKeys] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [daoProposals, setDAOProposals] = useState<DAOProposal[]>([]);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'social' | 'dao'>('social');

  const [viewingProfile, setViewingProfile] = useState<{css: string, html: string} | null>(null);

  const fetchDiscovery = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:1337/discovery');
      if (resp.ok) {
        const data = await resp.json();
        setDiscoveredKeys(data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchDAOProposals = async () => {
    try {
        const resp = await fetch('http://127.0.0.1:1337/dao/proposals');
        if (resp.ok) setDAOProposals(await resp.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const savedId = IdentityVault.get();
    if (savedId) {
        setIdentity(savedId);
        setViewingProfile({
            css: `body { background: #e9ebee; margin: 0; padding: 20px; font-family: sans-serif; } #myspace-subreddit-root { background: white; padding: 30px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; } h1 { color: #3b5998; border-bottom: 1px solid #ddd; padding-bottom: 10px; } p { line-height: 1.6; color: #333; }`,
            html: `<h1>${savedId.username}'s Sovereign Profile</h1><p>I own my data. No central server. No trackers. Just P2P.</p><div style="background: #f6f7f9; padding: 15px; margin-top: 20px; border: 1px solid #ddd;"><strong>Current Status:</strong> Building the decentralized future.</div>`
        });
    }
  }, []);

  useEffect(() => {
    if (identity) {
        aggregator.fetchFeed().then(setFeed);
        fetchDiscovery();
        fetchDAOProposals();
    }
  }, [identity]);

  const handleSubscribe = async () => {
    aggregator.subscribe(newKey);
    // Attempt to fetch and view the profile of the key we just subscribed to
    try {
      setFeedbackStatus('Fetching profile...');
      const response = await fetch(`http://127.0.0.1:1337/fetch?key=${newKey}`);
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();

      setViewingProfile({
        css: data.myspace_schema.theme_css_base64,
        html: data.myspace_schema.html_content || `<h1>Profile for ${data.username}</h1>`
      });
      setFeedbackStatus('Showing profile for: ' + newKey);
      setTimeout(() => setFeedbackStatus(''), 3000);
    } catch (e) {
      setFeedbackStatus('Failed to fetch profile (is sidecar running?)');
    }
    setNewKey('');
    aggregator.fetchFeed().then(setFeed);
  };

  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setFeedbackStatus('Feedback sent successfully! (Simulated)');
    setFeedback('');
    setTimeout(() => setFeedbackStatus(''), 3000);
  };

  const handleCreatePost = async () => {
    if (!identity || !newPostTitle) return;
    try {
        await fetch('http://127.0.0.1:1337/posts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: `post-${Date.now()}`,
                author_id: identity.dht_key,
                title: newPostTitle,
                target_key: 'TODO'
            })
        });
        setNewPostTitle('');
        aggregator.fetchFeed().then(setFeed);
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = async (username: string, css: string, html: string) => {
    setIsSavingProfile(true);
    console.log('Publishing profile for:', username);
    try {
      const response = await fetch('http://127.0.0.1:1337/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          myspace_schema: {
            theme_css_base64: css,
            html_content: html // Adjusting schema slightly for prototype
          }
        })
      });
      if (!response.ok) throw new Error('Publish failed');
      const data = await response.json();
      // Identity updated in Vault via save call inside generate (if we re-generate)
      // For handleSaveProfile, we just update the DHT key locally if it changed
      if (identity) {
          const updated = { ...identity, dht_key: data.dht_key };
          setIdentity(updated);
          IdentityVault.save(updated);
      }

      // Automatically register for discovery
      await fetch('http://127.0.0.1:1337/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dht_key: data.dht_key, username })
      });
      fetchDiscovery();
      setViewingProfile({ css, html });
      setFeedbackStatus('Profile published to Veilid!');
      setTimeout(() => setFeedbackStatus(''), 3000);
    } catch (e) {
      setFeedbackStatus('Failed to publish profile (is the sidecar running?)');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleVote = async (id: string, weight: number) => {
    if (!identity) return;
    try {
        await fetch('http://127.0.0.1:1337/dao/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposal_id: id,
                voter_id: identity.dht_key,
                weight
            })
        });
        fetchDAOProposals();
    } catch (e) { console.error(e); }
  };

  const handlePanic = () => {
      IdentityVault.clear();
      setIdentity(null);
      window.location.reload();
  };

  if (!identity) {
      return <SovereignOnboarding onAuthenticated={setIdentity} />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen transition-all">
      <header className="mb-10 border-b pb-6 flex justify-between items-center">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Veilid Reddit MySpace</h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">Decentralized, Serverless, Sovereign Social Fabric</p>
                <NetworkStatus />
            </div>
          </div>
          <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                  Social Feed
              </button>
              <button
                onClick={() => setActiveTab('dao')}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'dao' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                  <Gavel size={16} />
                  Governance DAO
              </button>
              <button
                onClick={handlePanic}
                title="Panic: Destructive Logout"
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
              >
                  <Skull size={16} />
                  Panic
              </button>
          </div>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Authenticated as {identity.username}</span>
            <div className="flex items-center gap-3">
                <p className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 truncate max-w-[200px]">{identity.dht_key}</p>
                <button onClick={() => { IdentityVault.clear(); setIdentity(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {activeTab === 'social' ? (
              <>
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Sovereign Profile Preview</h2>
                    <div className="border rounded-2xl overflow-hidden shadow-xl bg-white aspect-video lg:aspect-auto lg:h-[500px]">
                    {viewingProfile ? (
                        <ProfileContainer
                        cssStyles={viewingProfile.css}
                        htmlContent={viewingProfile.html}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 italic">
                        Publish a profile to see it here
                        </div>
                    )}
                    </div>
                </section>
                <ProfileEditor onSave={handleSaveProfile} isSaving={isSavingProfile} />
              </>
          ) : (
              <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Governance Proposals</h2>
                    <button
                        onClick={() => setShowProposalForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                    >
                        <Plus size={18} />
                        New Proposal
                    </button>
                  </div>

                  {showProposalForm && (
                      <DAOProposalForm
                        proposerId={identity.dht_key}
                        onCancel={() => setShowProposalForm(false)}
                        onSuccess={() => {
                            setShowProposalForm(false);
                            fetchDAOProposals();
                        }}
                      />
                  )}

                  <DAOProposalList proposals={daoProposals} onVote={handleVote} />
              </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <section className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Home Feed</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-2 mb-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                />
                <button
                    onClick={handleCreatePost}
                    disabled={!identity}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    Post update
                </button>
            </div>

            <div className="space-y-4">
              {feed.length > 0 ? feed.map(post => (
                <div key={post.post_id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                  <h3 className="font-bold text-blue-600 hover:underline cursor-pointer text-sm">{post.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">By: <span className="font-mono">{post.author_id.substring(0, 12)}...</span></p>

                  <CommentThread postId={post.post_id} myId={identity.dht_key} />
                </div>
              )) : (
                <p className="text-gray-400 italic text-sm">Your feed is empty.</p>
              )}
            </div>
          </section>

          <section className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Discover Profiles</h2>
            <div className="space-y-3">
              {discoveredKeys.length > 0 ? discoveredKeys.map(k => (
                <div key={k.dht_key} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg group">
                  <div>
                    <p className="font-bold text-sm text-gray-700">{k.username}</p>
                    <p className="text-[10px] font-mono text-gray-400 truncate w-32">{k.dht_key}</p>
                  </div>
                  <button
                    onClick={() => { setNewKey(k.dht_key); }}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Select
                  </button>
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">No profiles discovered yet.</p>
              )}
            </div>
          </section>

          <section className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <h2 className="text-lg font-bold mb-3">Join Subreddit</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Paste DHT Key..."
                className="w-full p-3 bg-blue-500 border border-blue-400 rounded-lg placeholder-blue-200 outline-none text-sm"
              />
              <button
                onClick={handleSubscribe}
                className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md"
              >
                Subscribe
              </button>
            </div>
          </section>

          <section className="p-6 bg-gray-800 rounded-2xl text-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-3">Feedback</h2>
            <div className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Suggestions?"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none text-sm h-24 resize-none"
              />
              <button
                onClick={handleFeedbackSubmit}
                className="w-full py-2 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-white transition-all"
              >
                Submit
              </button>
              {feedbackStatus && <p className="text-[10px] text-green-400 font-medium text-center">{feedbackStatus}</p>}
            </div>
          </section>
        </aside>
      </main>

      <footer className="mt-20 border-t pt-8 text-center text-gray-400 text-xs">
        <p>© 2024 Veilid Reddit MySpace • The P2P Revolution is Here</p>
      </footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
