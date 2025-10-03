import React, { useState, useEffect } from 'react';
import highlightWordInText from './utils/highlightWordInText.jsx';
import Header from './components/Header';
import Gallery from './components/Gallery';
import UploadModal from './components/UploadModal';
import DetailsOverlay from './components/DetailsOverlay';
import ErrorSnackbar from './components/ErrorSnackbar';
import Box from '@mui/material/Box';
import './App.css';

function App() {
  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  // selectedUpload may be a single upload object or an array of uploads when multi-select
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [topWords, setTopWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    setUploadsLoading(true);
    try {
      const baseURL = import.meta.env.PROD
        ? 'https://us-central1-{your-project-id}.cloudfunctions.net/creamyapp' // Update with your project ID
        : 'http://localhost:5001/{your-project-id}/us-central1/creamyapp'; // Firebase emulator URL
      const res = await fetch(`${baseURL}/uploads`);
      const data = await res.json();
      setUploads(data.uploads || []);
    } catch (e) {
      setError('Failed to fetch uploads.');
    }
    setUploadsLoading(false);
  };

  const getFirebaseURL = (endpoint) => {
    const baseURL = import.meta.env.PROD
      ? 'https://us-central1-{your-project-id}.cloudfunctions.net/creamyapp'
      : 'http://localhost:5001/{your-project-id}/us-central1/creamyapp';
    return `${baseURL}${endpoint}`;
  };

  const uploadImage = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', uploadFile);
    try {
      const res = await fetch(getFirebaseURL('/ocr'), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadModalOpen(false);
      setUploadFile(null);
      fetchUploads();
    } catch (e) {
      setError('Upload failed.');
    }
    setUploading(false);
  };

  const deleteImage = async (uploadId) => {
    try {
      const res = await fetch(getFirebaseURL(`/uploads/${uploadId}`), {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchUploads();
      // If the deleted image was in the details overlay, close it
      if (selectedUpload && (Array.isArray(selectedUpload) ?
          selectedUpload.some(u => u.id === uploadId) :
          selectedUpload.id === uploadId)) {
        handleDetailsClose();
      }
    } catch (e) {
      setError('Failed to delete image.');
    }
  };

  const handleCardClick = async (uploadOrArray) => {
    setSelectedUpload(uploadOrArray);
    setDetailsOpen(true);
    setLoading(true);
    setSelectedWord(null);

    const uploadsToFetch = Array.isArray(uploadOrArray) ? uploadOrArray : [uploadOrArray];

    try {
      // Fetch OCR for all selected uploads in parallel
      const promises = uploadsToFetch.map(u => fetch(getFirebaseURL(`/ocr?filename=${encodeURIComponent(u.filename)}`)).then(r => r.json()));
      const results = await Promise.all(promises);

      // For multiple images, we need to handle the Firestore document structure differently
      if (Array.isArray(uploadOrArray)) {
        // Set the actual document data for multiple images
        uploadsToFetch.forEach((upload, idx) => {
          if (results[idx]) {
            upload.ocr_text = results[idx].text;
            upload.top_words = results[idx].top_words;
          }
        });
        setOcrText(''); // Don't combine text for multiple images - each will be displayed separately
        setTopWords([]); // Top words will be generated per image
      } else {
        // Single image - combine as before for backward compatibility
        const combinedText = results.map(r => r.text || '').join('\n\n');
        const counts = {};
        results.forEach(r => {
          (r.top_words || []).forEach(([w, c]) => {
            const key = w.toLowerCase();
            counts[key] = (counts[key] || 0) + (Number(c) || 0);
          });
        });
        const combinedTopWords = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        setOcrText(combinedText);
        setTopWords(combinedTopWords);
      }
    } catch (e) {
      setError('Failed to fetch details.');
    }
    setLoading(false);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedUpload(null);
    setOcrText('');
    setTopWords([]);
    setSelectedWord(null);
    setImagePreviewOpen(false);
    setZoom(1);
    // signal Gallery to clear any multi-selection
    setClearSelectionSignal(s => s + 1);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-lightest) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(96, 165, 250, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Header onUploadClick={() => setUploadModalOpen(true)} />
        
        <Box sx={{ 
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 3, sm: 4, md: 6 },
          maxWidth: '1400px',
          mx: 'auto'
        }}>
          <Gallery
            uploads={uploads}
            uploadsLoading={uploadsLoading}
            onCardClick={handleCardClick}
            onDelete={deleteImage}
            clearSelectionSignal={clearSelectionSignal}
          />
        </Box>
      </Box>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploading={uploading}
        onUpload={uploadImage}
      />
      
      <DetailsOverlay
        open={detailsOpen && !!selectedUpload}
        upload={selectedUpload}
        onClose={handleDetailsClose}
        ocrText={ocrText}
        topWords={topWords}
        loading={loading}
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
        highlightWordInText={highlightWordInText}
        imagePreviewOpen={imagePreviewOpen}
        setImagePreviewOpen={setImagePreviewOpen}
        zoom={zoom}
        setZoom={setZoom}
      />
      
      <ErrorSnackbar error={error} setError={setError} />
    </Box>
  );
}

export default App;
