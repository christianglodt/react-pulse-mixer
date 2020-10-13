import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuIcon from '@material-ui/icons/Menu';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RefreshIcon from '@material-ui/icons/Refresh';
import useJsonLocalStorage from 'react-use-json-localstorage';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';

import SinkSelector from './SinkSelector.js';
import MixerList from './MixerList.js';
import './App.css';

function App(props) {

  const { backendUrl } = props;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sinks, setSinks] = React.useState(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    axios.get(`${backendUrl}sinks`)
    .then(function (response) {
      setSinks(response.data);
    })
    .catch(function (error) {
      setError(true);
    });
  }, [backendUrl, setSinks, setError]);

  const toggleDrawer = React.useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, setDrawerOpen]);

  const [selectedSinkIds, setSelectedSinkIds] = useJsonLocalStorage(`react-pulse-mixer-${window.location.pathname}-selected-sinks`, []);

  const toggleSinkSelected = React.useCallback((sink) => {
    if (selectedSinkIds.includes(sink.sink_id)) {
      setSelectedSinkIds(selectedSinkIds.filter(i => i !== sink.sink_id));
    } else {
      setSelectedSinkIds([...selectedSinkIds, sink.sink_id]);
    }
  }, [selectedSinkIds, setSelectedSinkIds]);

  const commitSink = useDebouncedCallback((sink) => {
    axios.post(`${backendUrl}sink/${sink.sink_id}/channels`, sink.channels)
    .catch(function (error) {
      setError(true);
    });

  }, 250);

  const onChannelChanged = React.useCallback((sink, channel, value) => {
    const newSinks = [...sinks];
    const s = newSinks.find(s => s.sink_id === sink.sink_id);
    const c = s.channels.find(c => Object.keys(c)[0] === channel.name);
    c[channel.name] = value;
    setSinks(newSinks);
    commitSink.callback(s);

  }, [sinks, setSinks, commitSink]);

  return (
    <div className="App">
      { sinks === null && error === false &&
        <div className='LoadingProgress'>
          <CircularProgress/>
        </div>
      }
      { error === true &&
        <div className='ErrorPage'>
          <div>An error occurred.</div>
          <IconButton className='RefreshButton' onClick={() => window.location.reload()}><RefreshIcon/></IconButton>
        </div>
      }
      { sinks !== null && error === false &&
        <>
          <Drawer open={drawerOpen} onClose={toggleDrawer}>
            <AppBar color="transparent" elevation={0} position="static">
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}><ArrowBackIcon /></IconButton>
                <Typography variant="h6">Sink Selection</Typography>
              </Toolbar>
            </AppBar>

            <SinkSelector sinks={sinks} selectedSinkIds={selectedSinkIds} onSelectSink={toggleSinkSelected}/>
          </Drawer>

          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}><MenuIcon /></IconButton>
              <Typography variant="h6">PulseAudio Mixer <span className='ServerName'>{sinks[0].sink_id.split('|')[0]}</span></Typography>
            </Toolbar>
          </AppBar>

          <MixerList sinks={sinks} selectedSinkIds={selectedSinkIds} onChannelChanged={onChannelChanged}/>
        </>
      }
    </div>
  );
}

export default App;
