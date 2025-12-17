// src/components/VideoUploader.jsx
import { useState, useRef } from 'react';
import axios from '../utils/axios';

export default function VideoUploader({ onUploadComplete, currentUrl = '' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('Fichier trop volumineux (max 500MB)');
      return;
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez MP4, WebM ou MOV.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const { data } = await axios.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      if (data.success) {
        setVideoUrl(data.data.url);
        onUploadComplete(data.data);
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (url) => {
    setVideoUrl(url);
    onUploadComplete({ url });
  };

  const clearVideo = () => {
    setVideoUrl('');
    onUploadComplete({ url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      {!videoUrl && !uploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-5xl mb-4">📹</div>
          <p className="text-gray-600 mb-2">Cliquez ou glissez une vidéo</p>
          <p className="text-sm text-gray-400">MP4, WebM ou MOV • Max 500MB</p>
        </div>
      )}

      {/* Progression upload */}
      {uploading && (
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <div className="flex-1">
              <p className="font-medium">Upload en cours...</p>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Vidéo uploadée */}
      {videoUrl && !uploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <span className="font-medium">Vidéo ajoutée</span>
            </div>
            <button
              onClick={clearVideo}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Supprimer
            </button>
          </div>
          
          {/* Aperçu vidéo */}
          {videoUrl.includes('cloudinary') || videoUrl.includes('http') ? (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg max-h-48 bg-black"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600 break-all">
              {videoUrl}
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Alternative : URL externe */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Ou collez une URL YouTube/Vimeo :</p>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => handleUrlInput(e.target.value)}
          placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
    </div>
  );
}
