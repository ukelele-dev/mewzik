import { SimpleLineIcons } from '@expo/vector-icons';
import React from 'react';
import color from '../misc/color';


const PlayerButton = (props) => {
    const {iconType, size=40, iconColor='#dc758f', onPress} = props
    const getIconName = (type) => {
        switch(type) {
            case 'PLAY':
                return 'control-pause'; // realted to play
            case 'PAUSE':
                return 'control-play'; // realted to pause
            case 'NEXT':
                return 'control-end'; // realted to next
            case 'PREV':
                return 'control-start'; // realted to previous
            case 'RAND':
                return 'shuffle'; // realted to previous
            case 'CONT':
                return 'loop'; // realted to previous
        }
    }

  return (
  <SimpleLineIcons {...props} onPress={onPress} name={getIconName(iconType)} size={size} color={iconColor} />
  );
}

export default PlayerButton;