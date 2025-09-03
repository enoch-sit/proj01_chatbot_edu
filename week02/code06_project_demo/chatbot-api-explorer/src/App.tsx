import { Box, Typography } from '@mui/joy';
import { ApiConfigPanel } from './components/config/ApiConfigPanel';
import { RequestConfigPanel } from './components/config/RequestConfigPanel';
import { ChatInterface } from './components/chat/ChatInterface';

/**
 * New App Component - Clean implementation based on working Tailwind pattern
 * 
 * Layout Strategy:
 * 1. Container: flex h-screen (height: 100vh, display: flex)
 * 2. Left Panel: flex flex-col with flex-1 overflow-y-auto
 * 3. Main Chat: flex-1 flex flex-col with scrollable messages
 * 4. Input Bar: fixed size at bottom (no flex-grow)
 */
function App() {

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      bgcolor: 'background.body'
    }}>
      
      {/* Left Panel - Configuration Section */}
      <Box sx={{ 
        width: '450px',
        bgcolor: 'background.surface',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Left Panel Header - Fixed */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider'
        }}>
          <Typography level="h3">
            Configuration
          </Typography>
        </Box>
        
        {/* Scrollable configuration content - flex-1 overflow-y-auto */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <ApiConfigPanel />
          <RequestConfigPanel />
        </Box>
      </Box>

      {/* Main Chat Area - flex-1 flex flex-col */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ChatInterface />
      </Box>
    </Box>
  );
}

export default App;
