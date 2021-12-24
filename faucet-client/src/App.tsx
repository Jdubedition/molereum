import React, { useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  TextField,
  Typography,
  Container,
  Grid,
  Button,
  LinearProgress,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import './App.css';


function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  const [accountAddress, setAccountAddress] = useState('');
  const [accountAddressIsInvalid, setAccountAddressIsInvalid] = useState(false);
  const [isProcessingSendRequest, setIsProcessingSendRequest] = useState(false);
  const [showSendRequestSuccess, setShowSendRequestSuccess] = useState(false);
  const [showSendRequestError, setShowSendRequestError] = useState(false);

  function handleTextFieldChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAccountAddress(event.target.value);
    setAccountAddressIsInvalid(event.target.value.length > 0 && !/^0x[0-9a-fA-F]{40}$/.test(event.target.value));
  }

  async function handleButtonClick() {
    setIsProcessingSendRequest(true);
    try {
      const response = await fetch(`${process.env.FAUCET_WORKER_ENDPOINT || 'http://localhost:8787'}/send/${accountAddress}`);
      if (response.status === 200) {
        setAccountAddress('Success!');
        setShowSendRequestSuccess(true);
        await new Promise(r => setTimeout(r, 3000));
        setAccountAddress('');
        setShowSendRequestSuccess(false);
      } else {
        setAccountAddress(`Error: ${response.statusText}`);
        setShowSendRequestError(true);
        await new Promise(r => setTimeout(r, 3000));
        setAccountAddress('');
        setShowSendRequestError(false);
      }
    } catch (error: any) {
      setAccountAddress(`Error: ${error.message}`);
      setShowSendRequestError(true);
      await new Promise(r => setTimeout(r, 3000));
      setAccountAddress('');
      setShowSendRequestError(false);
    }
    setIsProcessingSendRequest(false);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="App" maxWidth="md">
        <Typography variant="h2" sx={{ mt: 5, mb: 2 }}>
          Molereum Faucet
        </Typography>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={8} sx={{ mb: 2 }}>
            <TextField
              error={accountAddressIsInvalid}
              disabled={isProcessingSendRequest}
              id="account-address-textfield"
              sx={{ width: "100%" }}
              label="Account Address"
              variant="outlined"
              value={accountAddress}
              onChange={handleTextFieldChange}
              helperText={accountAddressIsInvalid ? "Incorrect entry." : ""}
            />
            {showSendRequestError &&
              <ErrorIcon htmlColor='#f44336D0' style={{ position: 'absolute' }} sx={{ mt: 2, ml: -5 }} />
            }
            {showSendRequestSuccess &&
              <CheckCircleIcon htmlColor='#4caf50' style={{ position: 'absolute' }} sx={{ mt: 2, ml: -5 }} />
            }
          </Grid>
        </Grid>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={8}>
            {isProcessingSendRequest &&
              <LinearProgress color="inherit" />
            }
          </Grid>
        </Grid>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={4} sx={{ my: 2 }}>
            <Button
              variant="outlined"
              disabled={accountAddress.length === 0 || accountAddressIsInvalid || isProcessingSendRequest}
              onClick={handleButtonClick}
            >Request MOLE</Button>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
