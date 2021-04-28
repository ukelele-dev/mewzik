import React, { Component, createContext } from 'react';
import { Alert, Text, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {DataProvider} from 'recyclerlistview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Audio} from 'expo-av';
import { playNext } from '../misc/audioController';
import { storeAudioForNextOpening } from '../misc/helper';

export const AudioContext = createContext()

export class AudioProvider extends Component {   
    constructor(props){
        super(props)
        this.state = {
            audioFiles: [],
            playlist: [],
            addToPlaylist: null,
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1 !== r2),
            playbackObject: null,
            soundObj: null,
            currentAudio: {},
            isPlaying: false,
            currentAudioIndex: null,
            playbackPosition: null,
            playbackDuration: null
        };
        this.totalAudioCount = 0
    }

        permissionAllert = () => {
            Alert.alert('Permissão requerida', "Este aplicativo necessita ler os áudios do dispositivo!", [{
                text: 'Estou pronto',
                onPress: this.getPermission()
            }, {
                text: 'Cancelar',
                onPress: () => this.permissionAllert()
            }])
        }

        getAudioFiles = async () => {
            const {dataProvider, audioFiles} = this.state
            let media = await MediaLibrary.getAssetsAsync({
                mediaType: 'audio',
            });
            media = await MediaLibrary.getAssetsAsync({
                mediaType: 'audio',
                first: media.totalCount,
            });
            this.totalAudioCount = media.totalCount;

            this.setState({
                ...this.state, 
                dataProvider: dataProvider.cloneWithRows([...audioFiles, ...media.assets]), 
                audioFiles: [...audioFiles, ...media.assets]
            });
        }

        loadPreviousAudio = async () => {
            let previousAudio = await AsyncStorage.getItem('previousAudio');
            let currentAudio;
            let currentAudioIndex;

            if(previousAudio === null){
                currentAudio = this.state.audioFiles[0];
                currentAudioIndex = 0
            } else {
                previousAudio = JSON.parse(previousAudio)
                currentAudio = previousAudio.audio
                currentAudioIndex = previousAudio.index
            }

            this.setState({...this.state, currentAudio, currentAudioIndex})
        }

        getPermission = async () => {
            const permission = await MediaLibrary.getPermissionsAsync()
            if (permission.granted){
                // pegar todos os audios
                this.getAudioFiles()
            }

            if(!permission.granted && permission.canAskAgain){
                const {status, canAskAgain} = await MediaLibrary.requestPermissionsAsync();
                if(status === 'denied' && canAskAgain){
                   //mostrar um alerta de que o usuário precisa permitir o acesso aos áudios
                    this.permissionAllert();
                }
                if(!permission.canAskAgain && !permission.granted ){
                    this.setState({...this.state, permissionError: true})
                }
                if(status === 'granted'){
                    //pegar os áudios do dispositivo
                    this.getAudioFiles()
                }
                if(status === 'denied' && !canAskAgain){
                    //informar erro pro usuário de que o app não consegue pegar os áudios
                    this.setState({...this.state, permissionError: true})
                }
            }
        }
        
        permissionAllert = () => {
            Alert.alert('Permissão requerida', "Este aplicativo necessita ler os áudios do dispositivo!", [{
                text: 'Estou pronto',
                onPress: this.getPermission()
            }, {
                text: 'Cancelar',
                onPress: () => this.permissionAllert()
            }])
        }

        onPlaybackStatusUpdate = async playbackStatus => {
            if(playbackStatus.isLoaded && playbackStatus.isPlaying){
                this.updateState(this, {
                    playbackPosition: playbackStatus.positionMillis,
                    playbackDuration: playbackStatus.durationMillis,
                });
            }
    
            if(playbackStatus.didJustFinish) {
                const nextAudioIndex = this.state.currentAudioIndex + 1;
                //there is no next audio to play or the current audio is the last one
                if(nextAudioIndex >= this.totalAudioCount) {
                    this.state.playbackObject.unloadAsync();
                    this.updateState(this, {
                        soundObj: null,
                        currentAudio: this.state.audioFiles[0],
                        isPlaying: false,
                        currentAudioIndex: 0,
                        playbackPosition: null,
                        playbackDuration: null
                    })
                    return await storeAudioForNextOpening(this.state.audioFiles[0], 0)
                }
                const audio = this.state.audioFiles[nextAudioIndex];
                const status = await playNext(this.state.playbackObject, audio.uri);
                this.updateState(this, {
                    soundObj: status,
                    currentAudio: audio,
                    isPlaying: true,
                    currentAudioIndex: nextAudioIndex,
                });
                await storeAudioForNextOpening(audio, nextAudioIndex)
            }
        };
    

    componentDidMount(){
        this.getPermission()
        if(this.state.playbackObject === null){
            this.setState({...this.state, playbackObject: new Audio.Sound()})
        }
    }

    updateState = (prevState, newState = {}) => {
        this.setState({...prevState, ...newState})
    }

  render() {
      const {
          audioFiles, 
          playlist,
          addToPlaylist,
          dataProvider, 
          permissionError, 
          playbackObject, 
          soundObj, 
          currentAudio, 
          isPlaying, 
          currentAudioIndex,
          playbackPosition,
          playbackDuration
        } = this.state
      if(this.state.permissionError) return <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
      }}>
          <Text style={{fontSize: 25, textAlign: 'center' , color: 'red'}}>
              Parece que você não aceitou as permissões
          </Text>
      </View>
    return (
        <AudioContext.Provider value={{
        audioFiles,
        playlist,
        addToPlaylist,
        dataProvider, 
        playbackObject, 
        soundObj, 
        currentAudio,
        isPlaying,
        currentAudioIndex,
        totalAudioCount: this.totalAudioCount,
        playbackPosition,
        playbackDuration,
        updateState: this.updateState,
        loadPreviousAudio: this.loadPreviousAudio,
        onPlaybackStatusUpdate: this.onPlaybackStatusUpdate,
        }}
        >
            {this.props.children}
        </AudioContext.Provider>
    )
    }
}

export default AudioProvider;