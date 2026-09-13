import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '../lib/api';

interface PhotoManagerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoManager = ({ photos, onPhotosChange, maxPhotos = 3 }: PhotoManagerProps) => {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handlePhotoSelect = async (slot: number, file: File) => {
    setError('');
    setUploadingSlot(slot);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPhotosChange(res.data.photos);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Photo upload failed. Please try again.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handlePhotoRemove = async (photoUrl: string) => {
    setError('');
    try {
      const res = await api.delete('/profile/photo', { data: { photoUrl } });
      onPhotosChange(res.data.photos);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not remove photo. Please try again.');
    }
  };

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}
      <div className="photo-grid">
        {Array.from({ length: maxPhotos }).map((_, i) => {
          const photoUrl = photos[i];
          const isUploading = uploadingSlot === i;

          return (
            <div key={i} className="photo-slot">
              {photoUrl ? (
                <>
                  <img src={photoUrl} alt={`Upload ${i + 1}`} />
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={() => handlePhotoRemove(photoUrl)}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                  <label className="photo-replace-label">
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoRemove(photoUrl).then(() => handlePhotoSelect(i, file));
                        }
                        e.target.value = '';
                      }}
                      hidden
                    />
                  </label>
                </>
              ) : (
                <label className="photo-upload-label">
                  {isUploading ? (
                    <span className="photo-uploading">Uploading...</span>
                  ) : (
                    <Upload size={20} />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoSelect(i, file);
                      e.target.value = '';
                    }}
                    disabled={isUploading}
                    hidden
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoManager;
