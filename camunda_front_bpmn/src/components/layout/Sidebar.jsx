import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  useTheme,
  Typography,
  Collapse,
  Stack,
  Tooltip
} from '@mui/material';
import {
  People,
  AccountTree,
  Edit,
  Task,
  PlayArrow,
  Dashboard,
  DynamicForm,
  ExpandLess,
  ExpandMore,
  TableChart,
  List as ListIcon,
  History,
  Assignment,
  Rule
} from '@mui/icons-material';
import { useState } from 'react';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 180;

const Sidebar = ({ open }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [formsOpen, setFormsOpen] = useState(false);

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <Dashboard /> },
    { to: '/admin/users', label: 'User Management', icon: <People /> },
    
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    
  ];

  const links = user?.role === 'ROLE_ADMIN' ? adminLinks : userLinks;

  // We no longer need the forms submenu with our new design
  const handleFormsClick = () => {
    setFormsOpen(!formsOpen);
  };

  const renderMenuItem = (link, index) => {
    if (link.type === 'forms') {
      const isFormsActive = location.pathname.startsWith(link.to);
      return (
        <React.Fragment key={link.label}>
          {index > 0 && index % 3 === 0 && <Divider sx={{ my: 1 }} />}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleFormsClick}
              selected={isFormsActive}
              sx={{
                minHeight: 48,
                px: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ width: '100%' }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: isFormsActive ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: isFormsActive ? 600 : 500,
                    color: isFormsActive ? theme.palette.primary.main : theme.palette.text.primary,
                    flexGrow: 1,
                  }}
                >
                  {link.label}
                </Typography>
                {open && (formsOpen ? <ExpandLess /> : <ExpandMore />)}
              </Stack>
            </ListItemButton>
          </ListItem>
          <Collapse in={formsOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {link.children.map((child) => (
                <ListItemButton
                  key={child.to}
                  sx={{
                    pl: 6,
                    py: 1,
                    minHeight: 40,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    },
                  }}
                  selected={location.pathname === child.to}
                  onClick={() => navigate(child.to)}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: location.pathname === child.to ? 600 : 400,
                      color: location.pathname === child.to ? theme.palette.primary.main : theme.palette.text.primary,
                    }}
                  >
                    {child.label}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={link.to}>
        {index > 0 && index % 3 === 0 && <Divider sx={{ my: 1 }} />}
        <ListItem disablePadding>
          <Tooltip title={!open ? link.label : ''} placement="right">
            <ListItemButton
              selected={location.pathname === link.to}
              onClick={() => navigate(link.to)}
              sx={{
                minHeight: 48,
                px: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ width: '100%' }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: location.pathname === link.to ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: location.pathname === link.to ? 600 : 500,
                    color: location.pathname === link.to ? theme.palette.primary.main : theme.palette.text.primary,
                    flexGrow: 1,
                  }}
                >
                  {link.label}
                </Typography>
              </Stack>
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {links.map((link, index) => renderMenuItem(link, index))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
