// src/components/ImageUploader.jsx
import { useState, useRef } from 'react';
import axios from '../utils/axios';

export default function ImageUploader({ onUploadComplete, currentUrl = '', label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image trop volumineuse (max 10MB)');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axios.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      if (data.success) {
        setImageUrl(data.data.url);
        onUploadComplete(data.data);
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    onUploadComplete({ url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Zone d'upload */}
      {!imageUrl && !uploading && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-gray-600 text-sm">Cliquez pour ajouter une image</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 10MB • 1280x720 recommandé</p>
        </div>
      )}

      {/* Progression upload */}
      {uploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm">Upload... {progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Image uploadée */}
      {imageUrl && !uploading && (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Aperçu"
            className="w-full h-40 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-800 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100"
            >
              Changer
            </button>
            <button
              onClick={clearImage}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
