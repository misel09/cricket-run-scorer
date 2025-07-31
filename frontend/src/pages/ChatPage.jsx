import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Paper, useMediaQuery, InputAdornment, Dialog, DialogContent, DialogActions, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download } from "lucide-react";
import { io } from "socket.io-client";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

const API = 'https://cricket-run-scorer-git-main-misel-patels-projects.vercel.app/';

const ChatPage = () => {
  const userEmail = localStorage.getItem('userEmail');
  const location = useLocation();
  const [chatList, setChatList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState(null); // { file, type }
  const [previewUrl, setPreviewUrl] = useState(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChatList, setLoadingChatList] = useState(false);

  // Responsive: is mobile screen?
  const isMobile = useMediaQuery('(max-width:600px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [chatOpenedFlag, setChatOpenedFlag] = useState(0); // used to trigger scroll
  // eslint-disable-next-line no-unused-vars
  const [downloadedFlag, setDownloadedFlag] = useState(0);

  // Socket ref
  const socketRef = useRef();

  // Ref for always-latest selectedUser
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Fetch chat list (sidebar)
  const fetchChatList = useCallback(() => {
    setLoadingChatList(true);
    fetch(`${API}/chat-list/${userEmail}`)
      .then(res => res.json())
      .then(data => setChatList(data))
      .finally(() => setLoadingChatList(false));
  }, [userEmail]);

  // Connect socket only once
  useEffect(() => {
    socketRef.current = io(API, { transports: ['websocket'] });

    if (userEmail) {
      socketRef.current.emit('join', userEmail);
    }

    socketRef.current.on('receive_message', (msg) => {
      const currentSelectedUser = selectedUserRef.current;
      if (
        currentSelectedUser &&
        ((msg.from === currentSelectedUser.email && msg.to === userEmail) ||
          (msg.from === userEmail && msg.to === currentSelectedUser.email))
      ) {
        setMessages(prev => [...prev, msg]);
      }
      // Always update chat list
      setLoadingChatList(true);
      fetch(`${API}/chat-list/${userEmail}`)
        .then(res => res.json())
        .then(data => setChatList(data))
        .finally(() => setLoadingChatList(false));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userEmail]);

  // Load chat list on mount and when userEmail changes
  useEffect(() => {
    if (!userEmail) return;
    fetchChatList();
  }, [userEmail, fetchChatList]);

  // Select first chat if none selected
  useEffect(() => {
    if (chatList.length && !selectedUser) setSelectedUser(chatList[0]);
  }, [chatList, selectedUser]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!userEmail || !selectedUser) return;
    setLoadingMessages(true);
    fetch(`${API}/chat?user1=${userEmail}&user2=${selectedUser.email}`)
      .then(res => res.json())
      .then(data => {
        const sortedMessages = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMessages(sortedMessages);
      })
      .finally(() => setLoadingMessages(false));
  }, [userEmail, selectedUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!messages.length) return;
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, chatOpenedFlag]);

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    const msg = { from: userEmail, to: selectedUser.email, text: message, date: new Date() };
    // Send to server via REST for saving
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    const data = await res.json();
    if (data.success) {
      setMessages(prev => [...prev, data.message]);
      setMessage('');
      fetchChatList();
      // Emit via socket for real-time
      if (socketRef.current) {
        socketRef.current.emit('send_message', data.message);
      }
    }
  };

  // File input refs
  const imageInputRef = useRef();
  const videoInputRef = useRef();
  const docInputRef = useRef();
  const cameraInputRef = useRef();

  // Handle file selection and preview
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile({ file, type });
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = ''; // reset input for next selection
  };

  // Handle send file
  const handleSendFile = async () => {
    if (!previewFile || !selectedUser) return;

    const formData = new FormData();
    formData.append('from', userEmail);
    formData.append('to', selectedUser.email);
    formData.append('type', previewFile.type);
    formData.append('file', previewFile.file);

    try {
      const res = await fetch(`${API}/chat/file`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
        fetchChatList();
        // Emit via socket for real-time
        if (socketRef.current) {
          socketRef.current.emit('send_message', data.message);
        }
      }
    } catch (err) {
      console.error('File send failed', err);
    }

    setPreviewFile(null);
    setPreviewUrl(null);
  };

  // Handle cancel preview
  const handleCancelPreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  // Download helpers
  const getDownloadedFiles = () => {
    try {
      return JSON.parse(localStorage.getItem('downloadedFiles') || '[]');
    } catch {
      return [];
    }
  };
  const setDownloadedFiles = (files) => {
    localStorage.setItem('downloadedFiles', JSON.stringify(files));
  };
  const handleDirectDownload = (url, filename) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Mark as downloaded
        const downloaded = getDownloadedFiles();
        if (!downloaded.includes(url)) {
          downloaded.push(url);
          setDownloadedFiles(downloaded);
          setDownloadedFlag(flag => flag + 1); // <-- trigger re-render
        }
      });
  };
  const isDownloaded = (url) => getDownloadedFiles().includes(url);

  // Delete multiple messages handler
  const handleDeleteSelectedMessages = async () => {
    for (const msgId of selectedMsgIds) {
      await fetch(`${API}/chat/message/${msgId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
    }
    setMessages(prev => prev.filter(msg => !selectedMsgIds.includes(msg._id)));
    setSelectedMsgIds([]);
    setDeleteMode(false);
  };

  // Clear chat handler (removes all messages and removes chat from chat list)
  const handleClearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm('Clear all messages in this chat?')) return;
    await fetch(`${API}/chat/clear/${userEmail}/${selectedUser.email}`, { method: 'DELETE' });
    setMessages([]);
    setAnchorEl(null);
    setChatList(prev => prev.filter(chat => chat.email !== selectedUser.email));
    setSelectedUser(null);
  };

  // Handle navigation to chat via query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    if (userParam && chatList.length > 0) {
      const found = chatList.find(chat => chat.email === userParam);
      if (found) {
        setSelectedUser(found);
      } else {
        // Optionally, fetch user info from API if not in chatList
        fetch(`${API}/user/${encodeURIComponent(userParam)}`)
          .then(res => res.json())
          .then(user => {
            setSelectedUser({
              email: user.email,
              name: user.name,
              profilePic: user.profilePic,
            });
          });
      }
    }
  }, [location.search, chatList]);

  // Chat list sorting and filtering
  const sortedChatList = [...chatList].sort((a, b) => {
    const dateA = a.lastDate ? new Date(a.lastDate) : new Date(0);
    const dateB = b.lastDate ? new Date(b.lastDate) : new Date(0);
    return dateB - dateA; // Newest first
  });

  const filteredChatList = sortedChatList.filter(chat =>
    chat.name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Mobile: show only sidebar or chat area
  const showSidebar = isMobile ? sidebarOpen : true;
  const showChatArea = isMobile ? !sidebarOpen : true;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        width: '100vw',
        height: '100vh',
        bgcolor: '#ece5dd',
        overflow: 'hidden',
        zIndex: 1300,
      }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <Paper
          elevation={3}
          sx={{
            width: { xs: '100vw', sm: 340 },
            maxWidth: { xs: '100vw', sm: 340 },
            bgcolor: '#fff',
            height: '100vh',
            position: { xs: 'absolute', sm: 'relative' },
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            borderRight: { sm: '1px solid #ddd' },
            left: 0,
            top: 0,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, pb: 1, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{ color: '#222', mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Chats
            </Typography>
          </Box>
          <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search or start a new chat"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
            />
          </Box>
          <Divider />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column', // <-- ensure column direction
              alignItems: 'stretch',
              justifyContent: 'flex-start', // <-- align chat list to top
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {loadingChatList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ flex: 0, p: 0, minHeight: 0 }}>
                {filteredChatList.map(chat => (
                  <React.Fragment key={chat.email}>
                    <ListItem
                      button
                      selected={selectedUser?.email === chat.email}
                      onClick={() => {
                        setSelectedUser(chat);
                        setChatOpenedFlag(prev => prev + 1);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      alignItems="flex-start"
                      sx={{
                        bgcolor: selectedUser?.email === chat.email ? '#e0f2f1' : 'inherit',
                        transition: 'background 0.2s',
                        py: 1.2,
                        px: 2,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={chat.profilePic || '/default-profile.png'} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{chat.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#888', minWidth: 60, textAlign: 'right' }}>
                              {chat.lastDate ? new Date(chat.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', maxWidth: 180 }}
                          >
                            {chat.lastMessage}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      )}

      {/* Chat area */}
      {showChatArea && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ece5dd',
            width: { xs: '100vw', sm: 'auto' },
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 1,
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#075e54',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              minHeight: 64,
              flexShrink: 0,
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => {
                  setSelectedUser(null);
                  if (isMobile) setSidebarOpen(true);
                }}
                sx={{
                  color: '#fff',
                  mr: 1,
                  display: { xs: 'inline-flex', sm: 'none' },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              {selectedUser && (
                <>
                  <Avatar
                    sx={{ mr: 2 }}
                    src={selectedUser.profilePic || '/default-profile.png'}
                  />
                  <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 20 } }}>
                    {selectedUser.name}
                  </Typography>
                </>
              )}
            </Box>
            {/* 3-dot menu */}
            {selectedUser && (
              <>
                <IconButton
                  onClick={e => setAnchorEl(e.currentTarget)}
                  sx={{ color: '#fff' }}
                  aria-label="Chat menu"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleClearChat}>
                    Clear Chat
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setDeleteMode(true);
                      setSelectedMsgIds([]);
                      setAnchorEl(null);
                    }}
                  >
                    Delete Message
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 1, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: '#ece5dd',
              minHeight: 0,
              flexShrink: 1,
              overflowY: 'auto',
              justifyContent: loadingMessages ? 'center' : 'flex-start',
              alignItems: loadingMessages ? 'center' : 'stretch',
            }}
          >
            {loadingMessages ? (
              <CircularProgress />
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <Box
                    key={msg._id || idx}
                    sx={{
                      alignSelf: msg.from === userEmail ? 'flex-end' : 'flex-start',
                      bgcolor: msg.from === userEmail ? '#dcf8c6' : '#fff',
                      color: '#222',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: { xs: '85%', sm: '70%' },
                      boxShadow: 1,
                      mb: 0.5,
                      fontSize: { xs: 14, sm: 16 },
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: deleteMode ? 'pointer' : 'default',
                      border: deleteMode && selectedMsgIds.includes(msg._id) ? '2px solid #f44336' : undefined,
                      opacity: deleteMode && selectedMsgIds.includes(msg._id) ? 0.7 : 1,
                    }}
                    onClick={e => {
                      if (deleteMode) {
                        e.stopPropagation();
                        setSelectedMsgIds(prev =>
                          prev.includes(msg._id)
                            ? prev.filter(id => id !== msg._id)
                            : [...prev, msg._id]
                        );
                      }
                    }}
                  >
                    {/* Message content */}
                    <Box sx={{ flex: 1 }}>
                      {(msg.type === 'image' || (!msg.type && msg.fileUrl && msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i))) && msg.fileUrl && (
                        <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: 200, borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                          <img
                            src={msg.fileUrl}
                            alt="img"
                            style={{ width: '100%', borderRadius: 8, display: 'block', cursor: isDownloaded(msg.fileUrl) ? 'pointer' : 'default' }}
                            onClick={e => {
                              e.stopPropagation();
                              if (isDownloaded(msg.fileUrl)) window.open(msg.fileUrl, '_blank');
                            }}
                          />
                          {!isDownloaded(msg.fileUrl) && (
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                handleDirectDownload(msg.fileUrl, msg.fileName || 'Image');
                              }}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.7)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                boxShadow: 1,
                              }}
                            >
                              <Download size={18} />
                            </IconButton>
                          )}
                        </Box>
                      )}

                      {msg.type === 'video' && msg.fileUrl && (
                        <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: 200, borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                          <video
                            src={msg.fileUrl}
                            controls
                            style={{ width: '100%', borderRadius: 8, display: 'block', cursor: isDownloaded(msg.fileUrl) ? 'pointer' : 'default' }}
                            onClick={e => {
                              e.stopPropagation();
                              if (isDownloaded(msg.fileUrl)) window.open(msg.fileUrl, '_blank');
                            }}
                          />
                          {!isDownloaded(msg.fileUrl) && (
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                handleDirectDownload(msg.fileUrl, msg.fileName || 'Video');
                              }}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.7)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                boxShadow: 1,
                              }}
                            >
                              <Download size={18} />
                            </IconButton>
                          )}
                        </Box>
                      )}

                      {msg.type === 'document' && msg.fileUrl && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#f5f5f5',
                            borderRadius: 2,
                            p: 1.5,
                            maxWidth: 260,
                            mb: 1,
                            boxShadow: 1,
                            minHeight: 56,
                            cursor: isDownloaded(msg.fileUrl) ? 'pointer' : 'default'
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            if (isDownloaded(msg.fileUrl)) {
                              window.open(msg.fileUrl, '_blank');
                            }
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 40, color: '#8e24aa', mr: 2 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                              {msg.fileName || 'Document'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Document
                            </Typography>
                          </Box>
                          {!isDownloaded(msg.fileUrl) && (
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                handleDirectDownload(msg.fileUrl, msg.fileName || 'Document');
                              }}
                              size="large"
                              sx={{ ml: 1 }}
                            >
                              <Download />
                            </IconButton>
                          )}
                        </Box>
                      )}
                      {msg.text}
                      <Typography variant="caption" sx={{ display: 'block', color: '#888', mt: 0.5 }}>
                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    {/* Show a checkmark if selected in delete mode */}
                    {deleteMode && (
                      <Box sx={{ ml: 1 }}>
                        <input
                          type="checkbox"
                          checked={selectedMsgIds.includes(msg._id)}
                          readOnly
                          style={{ pointerEvents: 'none' }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>
          {/* Input */}
          <Box
            sx={{
              p: { xs: 1, sm: 2 },
              bgcolor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {/* Pin icon with menu */}
            <IconButton
              onClick={() => setAttachOpen(true)}
              sx={{ mr: 1 }}
            >
              <AttachFileIcon />
            </IconButton>
            <Dialog open={attachOpen} onClose={() => setAttachOpen(false)} maxWidth="xs" fullWidth>
              <DialogContent sx={{ p: 3, pb: 2 }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                  justifyItems: 'center',
                  alignItems: 'center'
                }}>
                  {/* Gallery */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setAttachOpen(false);
                      imageInputRef.current.click();
                    }}
                  >
                    <InsertPhotoIcon sx={{ fontSize: 36, color: '#1976d2' }} />
                    <Typography variant="caption" sx={{ mt: 1 }}>Gallery</Typography>
                  </Box>
                  {/* Camera */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setAttachOpen(false);
                      cameraInputRef.current.click();
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 36, color: '#e91e63' }} />
                    <Typography variant="caption" sx={{ mt: 1 }}>Camera</Typography>
                  </Box>
                  {/* Video */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setAttachOpen(false);
                      videoInputRef.current.click();
                    }}
                  >
                    <VideoLibraryIcon sx={{ fontSize: 36, color: '#fbc02d' }} />
                    <Typography variant="caption" sx={{ mt: 1 }}>Video</Typography>
                  </Box>
                  {/* Document */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setAttachOpen(false);
                      docInputRef.current.click();
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 36, color: '#8e24aa' }} />
                    <Typography variant="caption" sx={{ mt: 1 }}>Document</Typography>
                  </Box>
                </Box>
              </DialogContent>
            </Dialog>
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={e => handleFileChange(e, 'image')}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => handleFileChange(e, 'image')}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={e => handleFileChange(e, 'video')}
            />
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={e => handleFileChange(e, 'document')}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              sx={{ bgcolor: '#fff', borderRadius: 2, fontSize: { xs: 14, sm: 16 } }}
              inputProps={{
                style: { padding: '10px 14px' },
              }}
              onFocus={() => {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            />
            <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
              <SendIcon />
            </IconButton>
          </Box>

          {/* Preview Dialog */}
          <Dialog open={!!previewFile} onClose={handleCancelPreview} maxWidth="xs" fullWidth>
            <DialogContent sx={{ textAlign: 'center' }}>
              {previewFile?.type === 'image' && previewUrl && (
                <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
              )}
              {previewFile?.type === 'video' && previewUrl && (
                <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
              )}
              {previewFile?.type === 'document' && previewFile?.file && (
                <Box>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {previewFile.file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(previewFile.file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelPreview}>Cancel</Button>
              <Button onClick={handleSendFile} variant="contained" color="primary">
                Send
              </Button>
            </DialogActions>
          </Dialog>

          {/* Below your messages list, show the delete/cancel buttons only in deleteMode */}
          {deleteMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setDeleteMode(false);
                  setSelectedMsgIds([]);
                }}
              >
                Cancel
              </Button>
              <Button
                color="error"
                variant="contained"
                disabled={selectedMsgIds.length === 0}
                onClick={handleDeleteSelectedMessages}
              >
                Delete Selected
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;
