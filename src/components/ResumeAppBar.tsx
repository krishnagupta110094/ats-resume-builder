import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface Props {
  window?: () => Window;
  onNav: (nav: string) => void;
  rightAction?: React.ReactNode;
}

const drawerWidth = 240;
const navItems = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Generate Resume', value: 'generate' },
  { label: 'Certificate Generator', value: 'certification' },
  { label: 'Profile', value: 'profile' },
  { label: 'Change Password', value: 'change-password' },
  { label: 'Customer Leads', value: 'leads' }
];


const ResumeAppBar: React.FC<Props> = (props) => {
  const { window, onNav, rightAction } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ATS Resume Builder
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => onNav(item.value)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <CssBaseline />
      <AppBar component="nav" position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}
          >
            ATS Resume Builder
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button key={item.value} sx={{ color: '#fff' }} onClick={() => onNav(item.value)}>
                {item.label}
              </Button>
            ))}
            {/* Right-aligned action (e.g., Logout) */}
            {rightAction && (
              <Box sx={{ ml: 2 }}>{rightAction}</Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default ResumeAppBar;
