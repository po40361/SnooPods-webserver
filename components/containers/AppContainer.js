import { connect } from "react-redux"
import store from "../../redux/store"
import { storeQueueInfo, getQueueInfo, pushNextTrack, replaceCurrentTrack, addPlaylistToQueue, clearCurrentPlaylist, removeTrackFromCurrentPlaylist, removePlaylistFromQueue, removeTrackFromQueue } from "../../redux/actions/queueActions";
import AudioPlayerBar from "../AudioPlayerBar"




function mapStateToProps(state) {
    // console.log("mapStateToProps", state)
    return state
}

const mapDispatchToProps = (dispatch) => ({

    changeQueueInfo: QueueInfo => dispatch(storeQueueInfo(QueueInfo)), 
    // getQueueInfo, 
    nextTrack: () => dispatch(replaceCurrentTrack()), 
    playNewTrack: (track) => dispatch(replaceCurrentTrack(track)), 
    addPlaylistToQueue: (newPlaylist) => dispatch(addPlaylistToQueue(newPlaylist)), 
    clearCurrentPlaylist: () => dispatch(clearCurrentPlaylist()), 
    removeTrackFromCurrentPlaylist: (trackID, index) => dispatch(removeTrackFromCurrentPlaylist(trackID, index)), 
    removePlaylistFromQueue: (playlistID) => dispatch(removePlaylistFromQueue(playlistID)), 
    removeTrackFromQueue: (playlistID, trackID, index) => dispatch(removeTrackFromQueue(playlistID, trackID, index))

})

export default connect(mapStateToProps, mapDispatchToProps)(AudioPlayerBar)