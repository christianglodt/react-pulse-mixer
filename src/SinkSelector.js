import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';

function SinkSelector(props) {

  const { sinks, selectedSinkIds, onSelectSink } = props;

  return (
    <List>
      {
        sinks.map(sink => (
          <ListItem button key={sink.sink_id} onClick={event => onSelectSink(sink)}>
            <ListItemText>{sink['device.description']}</ListItemText>
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={event => onSelectSink(sink)}>
                { selectedSinkIds.includes(sink.sink_id) &&
                  <StarIcon/>
                }
                { !selectedSinkIds.includes(sink.sink_id) &&
                  <StarBorderIcon/>
                }
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      }
    </List>
  );
}

export default SinkSelector;
