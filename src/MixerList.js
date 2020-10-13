import React from 'react';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import SpeakerGroupIcon from '@material-ui/icons/SpeakerGroup';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useJsonLocalStorage from 'react-use-json-localstorage';

import PulseMixerControls from './PulseMixerControls.js';

function MixerList(props) {

  const { sinks, selectedSinkIds, onChannelChanged } = props;

  const [collapsedSinks, setCollapsedSinks] = useJsonLocalStorage(`react-pulse-mixer-${window.location.pathname}-collapsed-sinks`, []);

  const toggleSinkCollapsed = React.useCallback((sink) => {
    if (collapsedSinks.includes(sink.sink_id)) {
      setCollapsedSinks(collapsedSinks.filter(i => i !== sink.sink_id));
    } else {
      setCollapsedSinks([...collapsedSinks, sink.sink_id]);
    }
  }, [collapsedSinks, setCollapsedSinks]);

  return (
    <List>
      {
        sinks.filter(s => selectedSinkIds.includes(s.sink_id)).map(sink => (
          <div key={sink.sink_id}>
            <ListItem className='SinkHeader' button onClick={event => toggleSinkCollapsed(sink)}>
              <ListItemIcon><SpeakerGroupIcon/></ListItemIcon>
              <ListItemText>{sink['device.description']}</ListItemText>
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={event => toggleSinkCollapsed(sink)}>
                  { collapsedSinks.includes(sink.sink_id) &&
                    <ExpandLessIcon/>
                  }
                  { !collapsedSinks.includes(sink.sink_id) &&
                    <ExpandMoreIcon/>
                  }
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>

            <Collapse in={collapsedSinks.includes(sink.sink_id)} timeout="auto" unmountOnExit>
              <ListItem>
                <PulseMixerControls sink={sink} onChannelChanged={onChannelChanged}/>
              </ListItem>
            </Collapse>
            <Divider/>
          </div>
        ))
      }
    </List>
  );
}

export default MixerList;
