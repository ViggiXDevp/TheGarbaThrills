import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api';

interface Gif {
  id: string;
  previewUrl: string;
  url: string;
}

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/chat/gifs/search', { params: { q: query } });
        setGifs(res.data.gifs);
      } catch {
        setGifs([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="chat-picker">
      <div className="chat-gif-search">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search GIFs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="chat-gif-loading">Loading...</div>
      ) : (
        <div className="chat-gif-grid">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              className="chat-gif-item"
              onClick={() => onSelect(gif.url)}
            >
              <img src={gif.previewUrl} alt="GIF" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GifPicker;
