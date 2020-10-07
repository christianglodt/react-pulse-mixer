import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useJsonLocalStorage from 'react-use-json-localstorage';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';

import PulseMixerControls from './PulseMixerControls.js';
import './App.css';

const BACKEND_URL = 'http://localhost:5000/';
const PATH = '';

function App() {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sinks, setSinks] = React.useState([]);

  React.useEffect(() => {
    axios.get(`${BACKEND_URL}sinks`)
    .then(function (response) {
      // handle success
      console.log(response.data);
      setSinks(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
  }, []);

  const toggleDrawer = React.useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, setDrawerOpen]);

  const [selectedSinks, setSelectedSinks] = useJsonLocalStorage(`react-pulse-mixer-${PATH}-selected-sinks`, []);
  const [collapsedSinks, setCollapsedSinks] = useJsonLocalStorage(`react-pulse-mixer-${PATH}-collapsed-sinks`, []);

  const toggleSinkSelected = React.useCallback((sink) => {
    if (selectedSinks.includes(sink.sink_index)) {
      setSelectedSinks(selectedSinks.filter(i => i !== sink.sink_index));
    } else {
      setSelectedSinks([...selectedSinks, sink.sink_index]);
    }
  }, [selectedSinks, setSelectedSinks]);

  const toggleSinkCollapsed = React.useCallback((sink) => {
    if (collapsedSinks.includes(sink.sink_index)) {
      setCollapsedSinks(collapsedSinks.filter(i => i !== sink.sink_index));
    } else {
      setCollapsedSinks([...collapsedSinks, sink.sink_index]);
    }
  }, [collapsedSinks, setCollapsedSinks]);

  const commitSink = useDebouncedCallback((sink) => {
    axios.post(`${BACKEND_URL}sink/${sink.sink_index}/channels`, sink.channels);
  }, 250);

  const onChannelChanged = React.useCallback((sink, channel, value) => {
    const newSinks = [...sinks];
    const s = newSinks.find(s => s.sink_index === sink.sink_index);
    const c = s.channels.find(c => Object.keys(c)[0] === channel.name);
    c[channel.name] = value;
    setSinks(newSinks);
    commitSink.callback(s);

  }, [sinks, setSinks, commitSink]);

  return (
    <div className="App">
      <Drawer open={drawerOpen} onClose={toggleDrawer}>
        <div>
          <IconButton onClick={toggleDrawer}><MenuIcon/> Sinks</IconButton>
        </div>
        <List>
          {
            sinks.map(sink => (
              <ListItem button key={sink.sink_index} onClick={event => toggleSinkSelected(sink)}>
                <ListItemText>{sink['device.description']}</ListItemText>
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={event => toggleSinkSelected(sink)}>
                    { selectedSinks.includes(sink.sink_index) &&
                      <StarIcon/>
                    }
                    { !selectedSinks.includes(sink.sink_index) &&
                      <StarBorderIcon/>
                    }
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          }
        </List>
      </Drawer>
      <IconButton onClick={toggleDrawer}><MenuIcon/></IconButton>

      <List>
        {
          sinks.filter(s => selectedSinks.includes(s.sink_index)).map(sink => (
            <div key={sink.sink_index}>
              <ListItem className='SinkHeader' button onClick={event => toggleSinkCollapsed(sink)}>
                <ListItemText>{sink['device.description']}</ListItemText>
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={event => toggleSinkCollapsed(sink)}>
                    { collapsedSinks.includes(sink.sink_index) &&
                      <ExpandMoreIcon/>
                    }
                    { !collapsedSinks.includes(sink.sink_index) &&
                      <ExpandLessIcon/>
                    }
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>

              { !collapsedSinks.includes(sink.sink_index) &&
              <ListItem>
                <PulseMixerControls sink={sink} onChannelChanged={onChannelChanged}/>
              </ListItem>
              }
            </div>
          ))
        }
      </List>

    </div>
  );
}

export default App;
