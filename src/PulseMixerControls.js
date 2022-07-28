import React from 'react';
import Slider from '@material-ui/core/Slider';
import ToggleButton from '@material-ui/lab/ToggleButton';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import useLocalStorageState from 'use-local-storage-state';

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

  const [joinedGroups, setJoinedGroups] = useLocalStorageState(`sink-${sink.sink_id}-joined-groups`, { defaultValue: [] });

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
