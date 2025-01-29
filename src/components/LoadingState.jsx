import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

export default function LoadingState({ type = 'list', count = 3 }) {
  if (type === 'list') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <Skeleton variant="rectangular" width={80} height={20} />
            <Skeleton variant="rectangular" width={120} height={20} />
            <Skeleton variant="rectangular" width="100%" height={20} />
            <Skeleton variant="rectangular" width={60} height={20} />
          </Box>
        ))}
      </Paper>
    );
  }

  if (type === 'chart') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Paper>
    );
  }

  return null;
}