import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';

export default function UploadModal({ open, onClose, onFileChange, onUpload, uploading, uploadFile }) {
  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ timeout: 300, sx: { background: 'rgba(10,35,66,0.18)' } }}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, minWidth: 340, boxShadow: '0 2px 16px #0002' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upload Image</Typography>
        <input type="file" accept="image/*" onChange={onFileChange} style={{ marginBottom: 16 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" disabled={!uploadFile || uploading} onClick={onUpload} sx={{ bgcolor: '#1e3a8a', fontWeight: 700 }}>{uploading ? 'Uploading...' : 'Upload'}</Button>
        </Box>
      </Box>
    </Modal>
  );
}
