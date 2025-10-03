import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import UploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';

export default function Header({ onUploadClick }) {
  return (
    <Box sx={{
      background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
        `,
        zIndex: 0
      }
    }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 3, sm: 4, md: 5 },
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <VisibilityIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}>
                  CreamyApp
                </Typography>
                <Typography variant="body2" sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mt: 0.5
                }}>
                  Intelligent Text Extraction
                </Typography>
              </Box>
            </Box>
          </Box>

        

          

          {/* Upload Button */}
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={onUploadClick}
            sx={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 'var(--radius-lg)',
              px: { xs: 3, sm: 4 },
              py: 1.5,
              boxShadow: 'var(--shadow-lg)',
              textTransform: 'none',
              minHeight: 48,
              '&:hover': {
                background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)',
                boxShadow: 'var(--shadow-xl)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Upload Image
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
