import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Music } from 'lucide-react';

interface MediaPlayerProps {
  src: string;
  title?: string;
  artist?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ src, title = "Unknown Track", artist = "Unknown Artist" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-3 text-white flex items-center gap-4 shadow-xl max-w-sm font-mono text-xs">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setIsPlaying(false)}
        loop
      />

      <button
        onClick={togglePlay}
        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-indigo-500/30"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1 text-indigo-300 mb-1">
          <Music size={12} className={isPlaying ? "animate-bounce" : ""} />
          <span className="font-bold truncate uppercase tracking-wider text-[10px]">Now Playing</span>
        </div>
        <p className="font-bold truncate">{title}</p>
        <p className="text-slate-400 truncate text-[10px]">{artist}</p>
      </div>

      <div className="shrink-0 text-slate-500">
        <Volume2 size={16} />
      </div>
    </div>
  );
};
