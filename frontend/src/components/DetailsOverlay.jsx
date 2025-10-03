import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Modal, Paper, Chip, Divider, TextField, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import structureExtractedText from '../utils/highlightWordInText.jsx';

export default function DetailsOverlay({
  open,
  onClose,
  upload,
  ocrText,
  topWords,
  loading,
  selectedWord,
  setSelectedWord,
  imagePreviewOpen,
  setImagePreviewOpen,
  zoom,
  setZoom,
}) {
  const [imgError, setImgError] = useState(false);
  const textContainerRef = useRef(null);
  const [previewUpload, setPreviewUpload] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // rendering

  // Function to scroll to the first occurrence of a word
  const scrollToWord = (word) => {
    if (!textContainerRef.current || !word) return;
    
    const textElement = textContainerRef.current;
    const text = textElement.textContent || textElement.innerText;
    const wordIndex = text.toLowerCase().indexOf(word.toLowerCase());
    
    if (wordIndex !== -1) {
      // Create a temporary element to measure the position
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'pre-wrap';
      tempElement.style.fontFamily = 'Inter, system-ui, sans-serif';
      tempElement.style.fontSize = '1rem';
      tempElement.style.lineHeight = '1.7';
      tempElement.style.padding = '24px';
      tempElement.style.width = textElement.offsetWidth + 'px';
      tempElement.textContent = text.substring(0, wordIndex);
      
      document.body.appendChild(tempElement);
      const scrollTop = tempElement.offsetHeight;
      document.body.removeChild(tempElement);
      
      // Scroll to the position with some offset
      textElement.scrollTop = Math.max(0, scrollTop - 50);
    }
  };

  // Effect to scroll to word when selectedWord changes
  useEffect(() => {
    if (!selectedWord) return;
    const timer = setTimeout(() => {
      scrollToWord(selectedWord);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedWord]);

  // Sync previewUpload when upload prop changes
  useEffect(() => {
    if (!upload) {
      setPreviewUpload(null);
      return;
    }
    if (Array.isArray(upload)) {
      setPreviewUpload(upload[0] || null);
    } else {
      setPreviewUpload(upload);
    }
    setImgError(false);
  }, [upload]);
  
  return (
    <>
    <Modal 
      open={open} 
      onClose={onClose}
      disableScrollLock={true}
      BackdropProps={{ 
        timeout: 300, 
        sx: { 
          background: 'rgba(30, 58, 138, 0.1)',
          backdropFilter: 'blur(8px)'
        } 
      }}
    >
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'white',
        overflowY: 'auto', 
        display: 'block',
        p: 0,
        zIndex: 1300,
        outline: 'none'
      }}>
        
        {!upload && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              No upload data available
            </Typography>
          </Box>
        )}
          {/* Header */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
            color: 'white', 
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ImageIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "white" }}>
                  {Array.isArray(upload) ? `${upload.length} images selected` : (upload ? upload.filename : '')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {Array.isArray(upload) ? 'Multiple dates' : (upload && upload.created_at ? new Date(upload.created_at).toLocaleString() : 'Unknown date')}
                    </Typography>
                  </Box>
                  <Chip 
                    label="Processed" 
                    size="small" 
                    sx={{ 
                      background: 'var(--success)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {Array.isArray(upload) && upload.map(u => (
                <img
                  key={u.id}
                  src={import.meta.env.PROD
                    ? `https://firebasestorage.googleapis.com/v0/b/{your-project-id}.appspot.com/o/uploaded_images%2F${u.filename}?alt=media`
                    : `http://localhost:5001/{your-project-id}/us-central1/creamyapp/uploaded_images/${u.filename}`
                  }
                  alt={u.filename}
                  onClick={() => setPreviewUpload(u)}
                  style={{
                    width: 56,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: previewUpload && previewUpload.id === u.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              ))}
              <IconButton onClick={onClose} sx={{ color: 'white', ml: 'auto' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
              gap: { xs: 3, sm: 4, md: 6 },
              alignItems: 'start',
              maxWidth: '1400px',
              mx: 'auto'
            }}>
              {/* Left Side: Image Preview */}
              <Box sx={{ 
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                p: 3,
                border: '1px solid var(--gray-200)',
                position: 'sticky',
                top: 100,
                height: 'fit-content'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <ImageIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                    Image Preview
                  </Typography>
          </Box>
                
              {!imgError ? (
                  <Box sx={{ 
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: 'white',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}>
                <img
                  src={previewUpload ? (
                    import.meta.env.PROD
                      ? `https://firebasestorage.googleapis.com/v0/b/{your-project-id}.appspot.com/o/uploaded_images%2F${previewUpload.filename}?alt=media`
                      : `http://localhost:5001/{your-project-id}/us-central1/creamyapp/uploaded_images/${previewUpload.filename}`
                  ) : ''}
                  alt={previewUpload ? previewUpload.filename : ''}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block'
                      }}
                  onClick={() => setImagePreviewOpen(true)}
                  onError={() => setImgError(true)}
                />
                  </Box>
                ) : (
                  <Box sx={{ 
                    color: 'var(--error)', 
                    fontWeight: 600, 
                    fontSize: '1rem', 
                    minHeight: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--gray-100)',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--gray-300)'
                  }}>
                    Image not found
                  </Box>
                )}

                <Button
                  variant="outlined"
                  startIcon={<ZoomInIcon />}
                  onClick={() => setImagePreviewOpen(true)}
                  sx={{
                    width: '100%',
                    mt: 3,
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'var(--primary)',
                      color: 'white'
                    }
                  }}
                >
                  View Full Size
                </Button>
              </Box>

              {/* Right Side: Text Analysis */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Extracted Text */}
                <Paper sx={{
                  background: 'white',
                  borderRadius: 'var(--radius-xl)',
                  p: 4,
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextFieldsIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        Extracted Text
                      </Typography>
                      {selectedWord && (
                        <Chip 
                          label={`Highlighting: "${selectedWord}"`} 
                          size="small" 
                          sx={{ 
                            background: 'var(--accent)', 
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ml: 1
                          }} 
                        />
                      )}
                    </Box>
                    <Chip 
                      label="Scrollable" 
                      size="small" 
                      sx={{ 
                        background: 'var(--primary-lightest)', 
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>

                  {/* Search Field */}
                  <TextField
                    fullWidth
                    placeholder="Search in extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        '&:hover fieldset': {
                          borderColor: 'var(--primary)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--primary)',
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'var(--primary)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchTerm('')}
                            sx={{ color: 'var(--gray-500)' }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Box 
                    ref={textContainerRef}
                    sx={{ 
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-lg)',
                      p: 3,
                      height: 400,
                      color: 'var(--gray-800)',
                      border: '1px solid var(--gray-200)',
                      whiteSpace: 'pre-wrap',
                      overflow: 'auto',
                      position: 'relative',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'var(--gray-200)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'var(--primary)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'var(--primary-dark)',
                      }
                    }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                        <Typography sx={{ color: 'var(--gray-600)' }}>
                          Extracting text...
                        </Typography>
            </Box>
                    ) : Array.isArray(upload) ? (
                      // Multiple images - show with separations
                      upload.map((img, idx) => {
                        const imgText = img.ocr_text || 'No text extracted';
                        const highlightWord = searchTerm || selectedWord;
                        return (
                          <Box key={img.id} sx={{ mb: idx < upload.length - 1 ? 3 : 0 }}>
                            {/* Image Header */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              mb: 2,
                              pb: 2,
                              borderBottom: '2px solid var(--primary)',
                            }}>
                              <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius)',
                                overflow: 'hidden',
                                border: '2px solid var(--primary)',
                                flexShrink: 0
                              }}>
                                <img
                                  src={import.meta.env.PROD
                                    ? `https://firebasestorage.googleapis.com/v0/b/{your-project-id}.appspot.com/o/uploaded_images%2F${img.filename}?alt=media`
                                    : `http://localhost:5001/{your-project-id}/us-central1/creamyapp/uploaded_images/${img.filename}`
                                  }
                                  alt={img.filename}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography sx={{ 
                                  fontWeight: 700, 
                                  fontSize: '0.9rem',
                                  color: 'var(--primary)',
                                  lineHeight: 1.2
                                }}>
                                  {img.filename}
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: '0.75rem',
                                  color: 'var(--gray-600)',
                                  lineHeight: 1.2
                                }}>
                                  Image {idx + 1} of {upload.length}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {/* Image Text */}
                            <Box sx={{ pl: 1 }}>
                              {structureExtractedText(imgText, highlightWord)}
                            </Box>
                            
                            {/* Divider between images */}
                            {idx < upload.length - 1 && (
                              <Divider sx={{ 
                                mt: 3,
                                borderColor: 'var(--gray-300)',
                                borderWidth: 1,
                                borderStyle: 'dashed'
                              }} />
                            )}
                          </Box>
                        );
                      })
                    ) : (
                      structureExtractedText(ocrText, searchTerm || selectedWord)
                    )}
                </Box>
                </Paper>

                {/* Top Words Analysis */}
                <Paper sx={{
                  background: 'white',
                  borderRadius: 'var(--radius-xl)',
                  p: 4,
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <AnalyticsIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                      Word Frequency Analysis
                    </Typography>
              </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {topWords.map(([word, count]) => (
                      <Chip
                      key={word}
                        label={`${word} (${count})`}
                        onClick={() => setSelectedWord(selectedWord === word ? null : word)}
                      sx={{
                          borderRadius: 'var(--radius-lg)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          px: 2,
                          py: 1,
                          height: 'auto',
                          background: selectedWord === word 
                            ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)' 
                            : 'var(--gray-100)',
                          color: selectedWord === word ? 'white' : 'var(--gray-700)',
                          border: selectedWord === word ? 'none' : '1px solid var(--gray-300)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: selectedWord === word 
                              ? 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)'
                              : 'var(--gray-200)',
                            transform: 'translateY(-1px)',
                            boxShadow: 'var(--shadow-md)'
                          }
                        }}
                      />
                  ))}
                </Box>
                </Paper>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{
            background: 'var(--gray-50)',
            borderTop: '1px solid var(--gray-200)',
            p: 4,
            mt: 6
          }}>
            <Box sx={{ 
              maxWidth: '1400px', 
              mx: 'auto',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                color: 'var(--gray-600)',
                fontWeight: 500
              }}>
                Powered by CreamyOCR - Intelligent Text Extraction
              </Typography>
            </Box>
          </Box>
        </Box>

    </Modal>

        {/* Full Image Preview Modal */}
        <Modal open={imagePreviewOpen} onClose={() => setImagePreviewOpen(false)}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        background: 'white', 
        borderRadius: 'var(--radius-xl)', 
        p: 3, 
        minWidth: '400px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--gray-200)',
        outline: 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--gray-900)' }}>
            Full Image Preview
          </Typography>
          <Button 
            onClick={() => setImagePreviewOpen(false)} 
            sx={{ 
              color: 'var(--gray-600)',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
            </Box>
        {/* Zoom Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          p: 2,
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)'
        }}>
          <Button 
            variant="outlined" 
            onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} 
            disabled={zoom <= 0.2}
            startIcon={<ZoomOutIcon />}
            sx={{ 
              minWidth: 40,
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              '&:hover': {
                background: 'var(--primary)',
                color: 'white'
              }
            }}
          >
            -
          </Button>
          <Typography sx={{ 
            minWidth: 60, 
            textAlign: 'center', 
            fontWeight: 700, 
            fontSize: '1rem',
            color: 'var(--gray-900)'
          }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => setZoom(z => Math.min(5, z + 0.2))} 
            disabled={zoom >= 5}
            startIcon={<ZoomInIcon />}
            sx={{ 
              minWidth: 40,
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              '&:hover': {
                background: 'var(--primary)',
                color: 'white'
              }
            }}
          >
            +
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button 
            variant="outlined" 
            onClick={() => setZoom(1)}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              '&:hover': {
                background: 'var(--accent)',
                color: 'white'
              }
            }}
          >
            Reset
          </Button>
            </Box>
        {/* Image Preview Area */}
        <Box sx={{ 
          overflow: 'auto', 
          maxWidth: '85vw', 
          maxHeight: '70vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--gray-50)', 
          borderRadius: 'var(--radius-lg)', 
          p: 2,
          border: '1px solid var(--gray-200)'
        }}>
          <img
            src={previewUpload ? (
              import.meta.env.PROD
                ? `https://firebasestorage.googleapis.com/v0/b/{your-project-id}.appspot.com/o/uploaded_images%2F${previewUpload.filename}?alt=media`
                : `http://localhost:5001/{your-project-id}/us-central1/creamyapp/uploaded_images/${previewUpload.filename}`
            ) : ''}
            alt={previewUpload ? previewUpload.filename : ''}
                style={{
                  width: `${zoom * 100}%`,
                  height: 'auto',
                  maxWidth: 'none',
                  maxHeight: 'none',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              background: 'white',
                  display: 'block',
                  cursor: zoom !== 1 ? 'zoom-out' : 'zoom-in',
              transition: 'box-shadow 0.2s ease',
                }}
                onClick={() => setZoom(zoom === 1 ? 2 : 1)}
              />
            </Box>
          </Box>
        </Modal>
    </>
  );
}
