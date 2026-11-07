import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Save, RefreshCw, GitMerge, Shield, Info } from 'lucide-react';
import { SubredditCRDTDoc, SubredditWikiState } from '../services/crdt';

interface SubredditWikiTabProps {
  peerId: string;
}

export const SubredditWikiTab: React.FC<SubredditWikiTabProps> = ({ peerId }) => {
  const [doc] = useState<SubredditCRDTDoc>(() => new SubredditCRDTDoc(peerId, 'Mesh Community Subreddit'));
  const [title, setTitle] = useState('Mesh Community Subreddit');
  const [rules, setRules] = useState('');
  const [sidebar, setSidebar] = useState('');
  const [moderators, setModerators] = useState<string[]>([peerId]);
  const [newModerator, setNewModerator] = useState('');
  const [peerStateInput, setPeerStateInput] = useState('');
  const [mergeStatus, setMergeStatus] = useState<string | null>(null);

  useEffect(() => {
    setTitle(doc.getTitle());
    setRules(doc.getRules());
    setSidebar(doc.getSidebar());
    setModerators(doc.getActiveModerators());
  }, [doc]);

  const handleApplyChanges = () => {
    doc.setTitle(title);
    doc.setRules(rules);
    doc.setSidebar(sidebar);
    setMergeStatus('Local CRDT state updated with Lamport timestamp.');
    setTimeout(() => setMergeStatus(null), 3500);
  };

  const handleMergeRemote = () => {
    try {
      const parsed: SubredditWikiState = JSON.parse(peerStateInput);
      doc.merge(parsed);
      setTitle(doc.getTitle());
      setRules(doc.getRules());
      setSidebar(doc.getSidebar());
      setModerators(doc.getActiveModerators());
      setMergeStatus('Successfully merged remote peer CRDT state deterministically!');
      setPeerStateInput('');
    } catch (e) {
      setMergeStatus('Failed to parse remote peer CRDT JSON state.');
    }
    setTimeout(() => setMergeStatus(null), 4000);
  };

  const handleExportState = () => {
    const json = doc.serialize();
    navigator.clipboard?.writeText(json);
    setMergeStatus('Exported CRDT state JSON copied to clipboard!');
    setTimeout(() => setMergeStatus(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Collaborative Subreddit Wiki (CRDT)</h2>
            <span
              title="Conflict-Free Replicated Data Type ensuring deterministic peer convergence without central authority"
              className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 font-medium rounded border border-indigo-200 cursor-help"
            >
              CvRDT Engine
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Offline-first, decentralized subreddit wiki editing. All edits merge deterministically across nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportState}
            title="Export your current CRDT state to share with peers"
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-all flex items-center gap-1.5"
          >
            <Save size={14} />
            Export State
          </button>
        </div>
      </div>

      {mergeStatus && (
        <div className="p-3 text-xs bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 flex items-center gap-2">
          <Info size={16} />
          {mergeStatus}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
              Subreddit Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-indigo-500"
              placeholder="e.g. Decentralized Computing"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
              Subreddit Rules (Markdown / Plaintext)
            </label>
            <textarea
              rows={4}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-indigo-500 resize-none font-mono text-xs"
              placeholder="1. Keep discussions sovereign&#10;2. No tracking or telemetry"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
              Sidebar & Description
            </label>
            <textarea
              rows={3}
              value={sidebar}
              onChange={(e) => setSidebar(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-indigo-500 resize-none text-xs"
              placeholder="Community resources and DHT keys..."
            />
          </div>

          <button
            onClick={handleApplyChanges}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow"
          >
            <Save size={16} />
            Commit Local Changes
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-amber-600" size={16} />
                <h3 className="text-sm font-bold text-gray-800">Active Moderators (LWW Set)</h3>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="peer_pubkey..."
                value={newModerator}
                onChange={(e) => setNewModerator(e.target.value)}
                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-indigo-500"
              />
              <button
                onClick={() => {
                  if (newModerator.trim()) {
                    doc.addModerator(newModerator.trim());
                    setModerators(doc.getActiveModerators());
                    setNewModerator('');
                    setMergeStatus('Moderator added to LWW Set.');
                    setTimeout(() => setMergeStatus(null), 3000);
                  }
                }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {moderators.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-full font-mono flex items-center gap-1"
                >
                  <Users size={12} className="text-gray-400" />
                  {m.length > 18 ? `${m.substring(0, 14)}...` : m}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <GitMerge className="text-blue-600" size={16} />
              <h3 className="text-sm font-bold text-gray-800">Merge Remote Peer CRDT State</h3>
            </div>
            <textarea
              rows={4}
              value={peerStateInput}
              onChange={(e) => setPeerStateInput(e.target.value)}
              placeholder="Paste exported Subreddit CRDT JSON here..."
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono resize-none focus:outline-blue-500"
            />
            <button
              onClick={handleMergeRemote}
              disabled={!peerStateInput.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} />
              Merge Deterministically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
