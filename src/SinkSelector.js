import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

function SinkSelector(props) {

  const { sinks, selectedSinkIds, onSelectSink } = props;

  return (
    <List>
      {
        sinks.map(sink => (
          <ListItem button dense key={sink.sink_id} onClick={event => onSelectSink(sink)}>
            <ListItemIcon>
              <Checkbox color="primary" edge="start" disableRipple checked={selectedSinkIds.includes(sink.sink_id)}/>
            </ListItemIcon>
            <ListItemText>{sink['device.description']}</ListItemText>
          </ListItem>
        ))
      }
    </List>
  );
}

export default SinkSelector;
