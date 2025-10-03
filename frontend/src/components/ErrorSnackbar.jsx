import React from 'react';
import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ErrorSnackbar({ error, setError }) {
  return (
    <Snackbar
      open={!!error}
      autoHideDuration={4000}
      onClose={() => setError('')}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      message={error}
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setError('')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
}
