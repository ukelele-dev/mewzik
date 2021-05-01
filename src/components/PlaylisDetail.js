import React from 'react';
import { View, StyleSheet, Modal, FlatList, Text, Dimensions } from 'react-native';
import color from '../misc/color';
import AudioListItem from './AudioLisItem';

const PlaylistDetail = ({visible, playlist, onClose}) => {
  return (
      <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
          <View style={styles.container} >
              <Text style={styles.title} >{playlist.title}</Text>
              <FlatList
                contentContainerStyle={styles.listContainer}
                data={playlist.audios} 
                keyExtractor={item => item.id.toString()} 
                renderItem={({item}) => 
                <View style={{marginBottom: 10}} >
                    <AudioListItem title={item.filename} duration={item.duration} />
                </View>
            }
              />
          </View>
      </Modal>
  )
}

const {height, width} = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        height: height - 150,
        width: width - 15,
        backgroundColor: color.FONT_MEDIUM, 
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    listContainer: {
        padding: 20
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 5,
        fontWeight: 'bold',
        color: color.ACTIVE_FONT
    }
})

export default PlaylistDetail