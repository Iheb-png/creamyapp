import React, { useState } from 'react';
import { Box, Grid, Card, CardMedia, CardContent, CardActionArea, Typography, CircularProgress, Chip, Avatar, Checkbox, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Gallery({ uploads, uploadsLoading, onCardClick, onDelete, clearSelectionSignal }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState(null);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedUploads = () => uploads.filter(u => selectedIds.includes(u.id));

  const handleViewDetails = () => {
    const sel = selectedUploads();
    if (sel.length === 0) return;
    onCardClick(sel);
    // keep selection until user closes details or clear manually
  };

  const handleDeleteClick = (e, upload) => {
    e.stopPropagation();
    setUploadToDelete(upload);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (uploadToDelete) {
      onDelete(uploadToDelete.id);
    }
    setDeleteDialogOpen(false);
    setUploadToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUploadToDelete(null);
  };

  // when parent signals, clear selection
  React.useEffect(() => {
    if (clearSelectionSignal) clearSelection();
  }, [clearSelectionSignal]);
  if (uploadsLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        gap: 3
      }}>
        <CircularProgress size={60} sx={{ color: 'var(--primary)' }} />
        <Typography variant="h6" sx={{ color: 'var(--gray-600)', fontWeight: 600 }}>
          Loading your images...
        </Typography>
      </Box>
    );
  }

  if (uploads.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        textAlign: 'center',
        p: 4
      }}>
        <Box sx={{
          p: 4,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-lightest) 0%, var(--primary-lighter) 100%)',
          mb: 3
        }}>
          <ImageIcon sx={{ fontSize: 64, color: 'var(--primary)' }} />
        </Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'var(--gray-800)', 
          mb: 2,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          No Images Yet
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'var(--gray-600)', 
          maxWidth: '400px',
          lineHeight: 1.6
        }}>
          Upload your first image to get started with intelligent text extraction and analysis.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {selectedIds.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={`${selectedIds.length} selected`} sx={{ fontWeight: 700 }} />
          <Button variant="contained" color="primary" onClick={handleViewDetails} sx={{ fontWeight: 700 }}>
            View Details
          </Button>
          <Button variant="outlined" onClick={clearSelection} sx={{ fontWeight: 600 }}>
            Clear
          </Button>
        </Box>
      )}
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: 'var(--gray-900)', 
          mb: 1,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Your Images
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
          {uploads.length} image{uploads.length !== 1 ? 's' : ''} processed
        </Typography>
      </Box>

      {/* Gallery Grid */}
      <Grid container spacing={3}>
        {uploads.map((upload, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={upload.id}>
            <Card 
              className="fade-in"
              sx={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--gray-200)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  boxShadow: 'var(--shadow-xl)',
                  transform: 'translateY(-8px)',
                  borderColor: 'var(--primary-light)',
                  '& .image-overlay': {
                    opacity: 1
                  }
                }
              }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardActionArea onClick={() => selectedIds.length ? toggleSelected(upload.id) : onCardClick(upload)} sx={{ p: 0 }}>
                {/* Image Container */}
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Checkbox for multi-select */}
                  <Checkbox
                    checked={selectedIds.includes(upload.id)}
                    onChange={() => toggleSelected(upload.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 5,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '8px',
                      padding: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'scale(1.05)'
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '24px',
                        color: selectedIds.includes(upload.id) ? 'var(--primary)' : 'var(--gray-400)',
                        transition: 'all 0.2s ease'
                      },
                      '&.Mui-checked .MuiSvgIcon-root': {
                        color: 'var(--primary)'
                      }
                    }}
                  />
                  <CardMedia
                    component="img"
                    height="200"
                    image={import.meta.env.PROD
                      ? `https://firebasestorage.googleapis.com/v0/b/{your-project-id}.appspot.com/o/uploaded_images%2F${upload.filename}?alt=media`
                      : `http://localhost:5001/{your-project-id}/us-central1/creamyapp/uploaded_images/${upload.filename}`
                    }
                    alt={upload.filename}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  
                  {/* Overlay */}
                  <Box
                    className="image-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(30, 58, 138, 0.9) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                      <VisibilityIcon sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        View Details
                      </Typography>
                    </Box>
                  </Box>

                  {/* Delete Button */}
                  <IconButton
                    onClick={(e) => handleDeleteClick(e, upload)}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--error)',
                      color: 'white',
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                      '&:hover': {
                        background: 'var(--error-dark)',
                        transform: 'scale(1.08)',
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
                        color: 'white'
                      },
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 6,
                      '&:active': {
                        transform: 'scale(0.95)'
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 0,
                        height: 0,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.2s, height 0.2s'
                      },
                      '&:hover:before': {
                        width: '100%',
                        height: '100%'
                      }
                    }}
                    size="small"
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  {/* Status Badge */}
                  <Chip
                    label="Processed"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 50,
                      right: 12,
                      background: 'var(--success)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Filename */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'var(--gray-900)', 
                      mb: 1,
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {upload.filename}
                  </Typography>

                  {/* Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: 'var(--gray-500)' }} />
                    <Typography variant="body2" sx={{ 
                      color: 'var(--gray-600)', 
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}>
                      {upload.created_at ? new Date(upload.created_at).toLocaleDateString() : 'Unknown date'}
                    </Typography>
                  </Box>

                  {/* Action Hint */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 'var(--radius)',
                    background: 'var(--gray-50)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24, 
                      background: 'var(--primary)',
                      fontSize: '0.75rem'
                    }}>
                      <VisibilityIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="caption" sx={{ 
                      color: 'var(--gray-600)', 
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      Click to analyze
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700, color: 'var(--gray-900)' }}>
          Delete Image?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: 'var(--gray-700)' }}>
            Are you sure you want to delete "{uploadToDelete?.filename}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{
              color: 'var(--gray-600)',
              fontWeight: 600,
              '&:hover': {
                background: 'var(--gray-100)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: 'var(--error)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'var(--error-dark)',
              }
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
