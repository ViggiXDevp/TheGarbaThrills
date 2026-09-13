import Sticker, { STICKER_IDS } from './Sticker';
import type { StickerId } from './Sticker';

interface StickerPickerProps {
  onSelect: (id: StickerId) => void;
}

const StickerPicker = ({ onSelect }: StickerPickerProps) => {
  return (
    <div className="chat-picker">
      <div className="chat-picker-grid">
        {STICKER_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="chat-picker-item"
            onClick={() => onSelect(id)}
            aria-label={id}
          >
            <Sticker id={id} size={48} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;
