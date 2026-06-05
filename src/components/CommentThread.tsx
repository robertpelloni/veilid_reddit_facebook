import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  timestamp: string;
}

interface CommentThreadProps {
  postId: string;
  myId: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ postId, myId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const resp = await fetch(`http://127.0.0.1:1337/comments/list?post_id=${postId}`);
      if (resp.ok) setComments(await resp.json() || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      await fetch('http://127.0.0.1:1337/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `cmt-${Date.now()}`,
          post_id: postId,
          author_id: myId,
          content: newComment,
          timestamp: new Date().toISOString()
        })
      });
      setNewComment('');
      fetchComments();
    } catch (e) { console.error(e); } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50">
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <MessageSquare size={14} />
        <span className="text-xs font-bold uppercase tracking-wider">Comments ({comments.length})</span>
      </div>

      <div className="space-y-3 mb-4">
        {comments.map(c => (
          <div key={c.id} className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="text-gray-800">{c.content}</p>
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400 font-mono">{c.author_id.substring(0, 12)}...</span>
                <span className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
