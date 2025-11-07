
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

  return (
    <Button 
      sx={{ color: '#fff' }} 
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
