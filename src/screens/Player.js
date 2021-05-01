import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { useContext, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import PlayerButton from '../components/PlayerButton';
import Screen from '../components/Screen';
import color from '../misc/color';
import { AudioContext } from '../context/AudioProvider';
import { pause, play, playNext, resume } from '../misc/audioController';
import { storeAudioForNextOpening } from '../misc/helper';

const {width} = Dimensions.get('window');

const Player = () => {
    const context = useContext(AudioContext);

    const {playbackPosition, playbackDuration} = context

    const calculateSeekBar = () => {
        if(playbackPosition !== null && playbackDuration !== null) {
            return playbackPosition / playbackDuration;
        }
        return 0
    }

    const handlePlayPause = async () => {
        // Play
        if(context.soundObj === null){
            const audio = context.currentAudio;
            const status = await play(context.playbackObject, audio.uri)
            context.playbackObject.setOnPlaybackStatusUpdate(context.onPlaybackStatusUpdate) 
            return context.updateState(context, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndex: context.currentAudioIndex
            })
        }
        //Pause
        if(context.soundObj && context.soundObj.isPlaying){
            const status = await pause(context.playbackObject);
            return context.updateState(context, {
                soundObj: status,
                isPlaying: false,
            })
        }
        //Resume
        if(context.soundObj && !context.soundObj.isPlaying){
            const status = await resume(context.playbackObject);
            return context.updateState(context, {
                soundObj: status,
                isPlaying: true,
            })
        }
    }

    const handleNext = async () => {
        const {isLoaded} = await context.playbackObject.getStatusAsync()
        const isLastAudio = context.currentAudioIndex + 1 === context.totalAudioCount;
        let audio = context.audioFiles[context.currentAudioIndex + 1]
        let index;
        let status;

        if(!isLoaded && !isLastAudio){
            index = context.currentAudioIndex + 1
            status = await play(context.playbackObject, audio.uri)
        }

        if(isLoaded && !isLastAudio){
            index = context.currentAudioIndex + 1
            status = await playNext(context.playbackObject, audio.uri)
        }

        if(isLastAudio){
            index = 0
            audio = context.audioFiles[index]
            if(isLoaded){
                status = await playNext(context.playbackObject, audio.uri)
            }else{
                status = await play(context.playbackObject, audio.uri)
            }
        }

        context.updateState(context, {
            currentAudio: audio,
            playbackObject: context.playbackObject,
            soundObj: status,
            isPlaying: true,
            currentAudioIndex: index,
            playbackPosition: null,
            playbackDuration: null,
        })

        storeAudioForNextOpening(audio, index)
    }

    const handlePrevious = async () => {
        const {isLoaded} = await context.playbackObject.getStatusAsync()
        const isFirstAudio = context.currentAudioIndex <= 1
        let audio = context.audioFiles[context.currentAudioIndex - 1]
        let index;
        let status;

        if(!isLoaded && !isFirstAudio){
            index = context.currentAudioIndex - 1
            status = await play(context.playbackObject, audio.uri)
        }

        if(isLoaded && !isFirstAudio){
            index = context.currentAudioIndex - 1
            status = await playNext(context.playbackObject, audio.uri)
        }

        if(isFirstAudio){
            index = context.totalAudioCount - 1
            audio = context.audioFiles[index]
            if(isLoaded){
                status = await playNext(context.playbackObject, audio.uri)
            }else{
                status = await play(context.playbackObject, audio.uri)
            }
        }

        context.updateState(context, {
            currentAudio: audio,
            playbackObject: context.playbackObject,
            soundObj: status,
            isPlaying: true,
            currentAudioIndex: index,
            playbackPosition: null,
            playbackDuration: null,
        })

        storeAudioForNextOpening(audio, index)
    }

    useEffect(() => {
        context.loadPreviousAudio()
    }, [])

    if(!context.currentAudio) return null;

  return (
      <Screen>
          <View style={styles.container}>
            <Text style={styles.audioCount}>{`${context.currentAudioIndex + 1} / ${context.totalAudioCount}`}</Text>
            <View style={styles.midBannerContainer}>
                <MaterialCommunityIcons name='music-circle' size={300} color={context.isPlaying ? color.ACTIVE_BG: color.FONT_MEDIUM} />
            </View>
            <View style={styles.audioPlayerContainer}>
                <Text numberOfLines={1} style={styles.audioTitle}>{context.currentAudio.filename}</Text>
                <Slider
                style={{width: width, height: 40}}
                minimumValue={0}
                maximumValue={1}
                value={calculateSeekBar()}
                minimumTrackTintColor={color.FONT_MEDIUM}
                maximumTrackTintColor={color.ACTIVE_BG}
                // thumbImage={tIcon}
                thumbTintColor={color.ACTIVE_BG}
                />
                <View style={styles.audioControllers}>
                    <PlayerButton iconType='RAND' size={20} />
                    <PlayerButton onPress={handlePrevious} style={{marginLeft: 40}} iconType='PREV' />
                    <PlayerButton onPress={handlePlayPause} style={{marginHorizontal: 25}} iconType={context.isPlaying ? 'PLAY' : 'PAUSE'} />
                    <PlayerButton onPress={handleNext} style={{marginRight: 40}} iconType='NEXT' />
                    <PlayerButton iconType='CONT' size={20}/>
                </View>
            </View>
          </View>
      </Screen>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    audioCount: {
        textAlign:'right',
        padding: 15,
        color: color.FONT_LIGHT,
        fontSize: 14,
    },
    midBannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    audioTitle: {
        fontSize: 16,
        color: color.FONT,
        padding: 15
    }, 
    audioControllers: {
        width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    }
})

export default Player;