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
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import axios from 'axios';

function PulseMixerControls(props) {
  const { sink } = props;

  const channelObjs = sink.channels.map(c => {
    const n = Object.keys(c)[0];
    return { name: n, volume: c[n] * 100 };
  });

  return (
    <div className='SliderRow'>
      { channelObjs.map((channel, index) => (
        <div className='SliderBox' key={index}>
          <div>{Number(channel.volume).toFixed(0)}%</div>
          <Slider className='VolumeSlider' orientation='vertical' min={0} max={100} value={channel.volume} onChange={(event, value) => props.onChannelChanged(sink, channel, value / 100)}/>
          <div>{channel.name}</div>
        </div>
      ))
      }
    </div>
  );
}

export default PulseMixerControls;
