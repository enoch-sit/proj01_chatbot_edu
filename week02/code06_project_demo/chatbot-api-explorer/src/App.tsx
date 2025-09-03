import { Box, Typography, Container, Grid } from '@mui/joy';
import { ApiConfigPanel } from './components/config/ApiConfigPanel';
import { RequestConfigPanel } from './components/config/RequestConfigPanel';
import { ChatInterface } from './components/chat/ChatInterface';
import { RawResponsePanel } from './components/response/RawResponsePanel';
import './App.css';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body' }}>
      {/* Header */}
      <Box component="header" sx={{ 
        bgcolor: 'background.surface', 
        borderBottom: 1, 
        borderColor: 'divider',
        py: 3
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography level="h1" sx={{ mb: 1 }}>
                AI Chat Bot API Explorer
              </Typography>
              <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                Investigate and test various LLM/Multimodal APIs with full customization
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                Built with Vite + React + TypeScript
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
            {/* Left Panel - Configuration */}
            <Grid xs={12} lg={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', overflow: 'auto' }}>
                <ApiConfigPanel />
                <RequestConfigPanel />
              </Box>
            </Grid>

            {/* Center Panel - Chat Interface */}
            <Grid xs={12} lg={6}>
              <ChatInterface />
            </Grid>

            {/* Right Panel - Raw Response */}
            <Grid xs={12} lg={3}>
              <RawResponsePanel />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ 
        bgcolor: 'background.surface', 
        borderTop: 1, 
        borderColor: 'divider',
        py: 2
      }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center' }}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              AI Chat Bot API Explorer - A comprehensive tool for testing LLM APIs
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
