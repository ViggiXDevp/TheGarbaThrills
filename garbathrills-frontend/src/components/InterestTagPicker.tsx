interface InterestTagPickerProps {
  availableTags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const InterestTagPicker = ({
  availableTags,
  selected,
  onChange,
  maxTags = 8,
}: InterestTagPickerProps) => {
  const toggleInterest = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
      return;
    }
    if (selected.length >= maxTags) {
      return;
    }
    onChange([...selected, tag]);
  };

  return (
    <div className="tag-grid">
      {availableTags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            type="button"
            key={tag}
            className={`tag-pill ${isSelected ? 'tag-pill-selected' : ''}`}
            onClick={() => toggleInterest(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default InterestTagPicker;
