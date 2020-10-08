import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import SpeakerGroupIcon from '@material-ui/icons/SpeakerGroup';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';
import useJsonLocalStorage from 'react-use-json-localstorage';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';

import PulseMixerControls from './PulseMixerControls.js';
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

  const [selectedSinks, setSelectedSinks] = useJsonLocalStorage(`react-pulse-mixer-${window.location.pathname}-selected-sinks`, []);
  const [collapsedSinks, setCollapsedSinks] = useJsonLocalStorage(`react-pulse-mixer-${window.location.pathname}-collapsed-sinks`, []);

  const toggleSinkSelected = React.useCallback((sink) => {
    if (selectedSinks.includes(sink.sink_id)) {
      setSelectedSinks(selectedSinks.filter(i => i !== sink.sink_id));
    } else {
      setSelectedSinks([...selectedSinks, sink.sink_id]);
    }
  }, [selectedSinks, setSelectedSinks]);

  const toggleSinkCollapsed = React.useCallback((sink) => {
    if (collapsedSinks.includes(sink.sink_id)) {
      setCollapsedSinks(collapsedSinks.filter(i => i !== sink.sink_id));
    } else {
      setCollapsedSinks([...collapsedSinks, sink.sink_id]);
    }
  }, [collapsedSinks, setCollapsedSinks]);

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
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}><MenuIcon /></IconButton>
                <Typography variant="h6">Sink Selection</Typography>
              </Toolbar>
            </AppBar>

            <List>
              {
                sinks.map(sink => (
                  <ListItem button key={sink.sink_id} onClick={event => toggleSinkSelected(sink)}>
                    <ListItemText>{sink['device.description']}</ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={event => toggleSinkSelected(sink)}>
                        { selectedSinks.includes(sink.sink_id) &&
                          <StarIcon/>
                        }
                        { !selectedSinks.includes(sink.sink_id) &&
                          <StarBorderIcon/>
                        }
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              }
            </List>
          </Drawer>

          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}><MenuIcon /></IconButton>
              <Typography variant="h6">PulseAudio Mixer <span className='ServerName'>{sinks[0].sink_id.split('|')[0]}</span></Typography>
            </Toolbar>
          </AppBar>

          <List>
            {
              sinks.filter(s => selectedSinks.includes(s.sink_id)).map(sink => (
                <div key={sink.sink_id}>
                  <ListItem className='SinkHeader' button onClick={event => toggleSinkCollapsed(sink)}>
                    <ListItemIcon><SpeakerGroupIcon/></ListItemIcon>
                    <ListItemText>{sink['device.description']}</ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={event => toggleSinkCollapsed(sink)}>
                        { collapsedSinks.includes(sink.sink_id) &&
                          <ExpandMoreIcon/>
                        }
                        { !collapsedSinks.includes(sink.sink_id) &&
                          <ExpandLessIcon/>
                        }
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>

                  { !collapsedSinks.includes(sink.sink_id) &&
                  <ListItem>
                    <PulseMixerControls sink={sink} onChannelChanged={onChannelChanged}/>
                  </ListItem>
                  }
                  <Divider/>
                </div>

              ))
            }
          </List>
        </>
      }
    </div>
  );
}

export default App;
