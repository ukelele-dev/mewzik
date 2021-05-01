import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import PlayListInputModal from '../components/PlayListInputModal';
import color from '../misc/color';
import { AudioContext } from '../context/AudioProvider';
import PlaylistDetail from '../components/PlaylisDetail';

let selectedPlaylist = {}

const PlayList = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [showPlaylist, setShowPlaylist] = useState(false)

    const context = useContext(AudioContext)
    const {playlist, addToPlaylist, updateState} = context

    const createPlaylist = async playlistName => {
        const result = await AsyncStorage.getItem('playlist')
        if(result !== null){
            const audios = []
            if(addToPlaylist){
                audios.push(addToPlaylist)
            }
            const newList = {
                id: Date.now(),
                title: playlistName,
                audios: audios
            }

            const updatedList = [...playlist, newList]
            updateState(context, {addToPlaylist: null, playlist: updatedList})
            await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))
        }
        setModalVisible(false)
    }

    const renderPlaylist = async () => {
        const result = await AsyncStorage.getItem('playlist')
        if(result === null){
            const defaultPlaylist = {
                id: Date.now(),
                title: "Minhas Favoritas",
                audios: []
            }
            const newPlaylist = [...playlist, defaultPlaylist]
            updateState(context, {playlist: [...newPlaylist]})
            return await AsyncStorage.setItem('playlist', JSON.stringify([...newPlaylist]))
        }
        updateState(context, {playlist: JSON.parse(result)})
    }

    useEffect(() => {
        if(!playlist.lengh){
            renderPlaylist()
        }
    }, [])

    const handleBannerPress = async (playlist) => {
        // update playlist if there is any selected audio
        if (addToPlaylist){
            //check if the same audio is already inside the playlist
            const result = await AsyncStorage.getItem('playlist')

            let oldList = []
            let updatedList = []
            let sameAudio = false

            if (result !== null){
                oldList = JSON.parse(result)
                updatedList = oldList.filter(list => {
                    if (list.id === playlist.id){
                        for (let audio of list.audios){
                            if (audio.id === addToPlaylist.id){
                                sameAudio = true
                                return
                            }
                        }

                        list.audios = [...list.audios, addToPlaylist]
                    }
                    return list
                })
            }
            if(sameAudio){
                Alert.alert('Mesma música encontrada!', `${addToPlaylist.filename} já existe nesta Playlist`)
                sameAudio = false
                return updateState(context, {addToPlaylist: null})
            }

            updateState(context, {addToPlaylist: null, playlist: [...updatedList]})
            return AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]))
        }
        //if there is no audio selected then we want to open the list
        selectedPlaylist = playlist
        setShowPlaylist(true)
    }
  
    return (
        <>
      <ScrollView contentContainerStyle={styles.container}>

          {playlist.length 
          ? playlist.map(item => (
          <TouchableOpacity key={item.id.toString()} style={styles.playlistBanner} onPress={() => handleBannerPress(item)}>
              <Text>{item.title}</Text>
              <Text style={styles.audioCount}>
                  {item.audios.length > 1 
                  ? `${item.audios.length} músicas` 
                  : `${item.audios.length} música`}
              </Text>
          </TouchableOpacity>
          )) 
          : null}

          <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={{marginTop: 15}}
          >
              <Text style={styles.playlistButton}>+ Add New Playlist</Text>
          </TouchableOpacity>

            <PlayListInputModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)}
            onSubmit={createPlaylist}
            />

      </ScrollView>
      <PlaylistDetail visible={showPlaylist} playlist={selectedPlaylist} onClose={() => setShowPlaylist(false)}/>
      </>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    audioCount: {
        marginTop: 3,
        opacity: 0.5,
        fontSize: 14,
    },
    playlistBanner: {
        padding: 5,
        backgroundColor: 'rgba(204, 204, 204, 0.8)',
        borderRadius: 5,
        marginBottom: 15,
    },
    playlistButton: {
        color: color.ACTIVE_FONT,
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 14,
        padding: 5,
    }
})

export default PlayList;
