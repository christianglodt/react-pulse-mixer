import React from 'react';
import Slider from '@material-ui/core/Slider';
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
import ToggleButton from '@material-ui/lab/ToggleButton';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import useJsonLocalStorage from 'react-use-json-localstorage';
import axios from 'axios';

function findChannelGroups(channelObjs) {
  const groups = {};
  for (const c of channelObjs) {
    const nameParts = c.name.split('-');
    if (groups[nameParts[0]] === undefined) {
      groups[nameParts[0]] = [];
    }
    const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
    groups[nameParts[0]].push({...c, displayName: displayName});
  }
  return Object.keys(groups).map(groupName => ({ groupName: groupName, channels: groups[groupName]}));
}

function PulseMixerControls(props) {
  const { sink } = props;

  const channelObjs = sink.channels.map(c => {
    const n = Object.keys(c)[0];
    return { name: n, volume: c[n] * 100 };
  });

  const channelGroups = findChannelGroups(channelObjs);

  const [joinedGroups, setJoinedGroups] = useJsonLocalStorage(`${props.storageQualifier}-sink-${sink.sink_index}-joined-groups`, []);

  const onGroupJoinedToggled = React.useCallback(group => {
    if (joinedGroups.includes(group.groupName)) {
      setJoinedGroups(joinedGroups.filter(n => n !== group.groupName));
    } else {
      setJoinedGroups([...joinedGroups, group.groupName]);
      const lowestVolume = Math.min(...group.channels.map(c => c.volume));
      for (const c of group.channels) {
        props.onChannelChanged(sink, c, lowestVolume / 100);
      }
    }
  }, [joinedGroups, setJoinedGroups, props, sink]);

  const onChannelChanged = React.useCallback((sink, group, channel, value) => {
    props.onChannelChanged(sink, channel, value);
    if (joinedGroups.includes(group.groupName)) {
      for (const c of group.channels.filter(c => c !== channel)) {
        props.onChannelChanged(sink, c, value);
      }
    }

  }, [joinedGroups, props]);

  return (
    <div className='SliderRow'>

      { channelGroups.map((group, index) => (
        <div className='SliderGroup' key={index}>
          <div className='JoinChannelsLabel'>
            { group.channels.length > 1 &&
            <>
            <ToggleButton size='small' value='' selected={joinedGroups.includes(group.groupName)} onChange={() => onGroupJoinedToggled(group)}>
              <CompareArrowsIcon/>
            </ToggleButton>
            <br/>
            <span className='capitalize'>{group.groupName}</span>
            </>
            }
          </div>
          <div key={index} className='SliderGroupInner'>
            { group.channels.map((channel, index) => (
              <div className='SliderBox' key={index}>
                <div className="capitalize">{channel.displayName}</div>
                <Slider className='VolumeSlider' orientation='vertical' min={0} max={100} value={channel.volume} onChange={(event, value) => onChannelChanged(sink, group, channel, value / 100)}/>
                <div>{Number(channel.volume).toFixed(0)}%</div>
              </div>
            ))
            }
          </div>
        </div>
      ))
      }

    </div>
  );
}

export default PulseMixerControls;
