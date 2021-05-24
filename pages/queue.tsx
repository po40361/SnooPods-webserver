import Layout from "../components/layout"
import CustomNavbar from "../components/CustomNavbar"
import React, { useState, useEffect } from 'react';
import validateSession from "../lib/validateUserSessionOnPage"
import isEmpty from "../lib/isEmptyObject"
import Sidebar from "../components/Sidebar"
import { AudioPlayerStore } from "../redux/store";
import AudioPlayerBarContainer from "../components/containers/AudioPlayerBarContainer";
import { Provider, useStore, useSelector } from "react-redux";
import parseCookies from "../lib/parseCookies"
import fetch from "isomorphic-unfetch"
import { connect } from "react-redux"


import { QueueStore } from "../redux/store";
import { storeQueueInfo, getQueueInfo, pushNextTrack, replaceCurrentTrack, addPlaylistToQueue, clearCurrentPlaylist, removeTrackFromCurrentPlaylist, removePlaylistFromQueue, removeTrackFromQueue } from "../redux/actions/queueActions";
import {QueuePlaylist, Track} from "../ts/interfaces"

const Queue = ({ userSession }) => {
    // const store = useStore()


    const [user, setUser] = useState({})
    useEffect(() => {
      const validateUserSession = async (session_id, email) => {
        let user = await validateSession(session_id, email);
        // console.log(user)
        setUser(user)
      }

      const getQueue = async(email) =>{
          const getQueueRes = await fetch("/api/queue/getQueue/", {
              method: "POST", body: JSON.stringify({email: email})
            })
            let userQueueInfo = await getQueueRes.json()
            console.log("getQueue result:", userQueueInfo)

            // let currTrackInfo = {}
            let currTrack = ""
            let currentPlaylist = userQueueInfo.currentPlaylist
            let queue = userQueueInfo.queue

            if(userQueueInfo.currentTrack.length == 0){
              if (currentPlaylist.tracks.length == 0){
                // get first track from queue
                if(queue.length == 0){
                  // nothing in queue. show empty player
                  console.log("currentTrack, currPlaylist and queue are empty in db.")

                } else{
                  console.log("currentTrack and currPlaylist are empty in db. grabbing currTrack from queue")

                  currTrack = queue[0].tracks[0] 
                  // const trackRes = await fetch("/api/getTrack/" + currTrack, {method: "GET"})
                  // currentTrackInfo = await trackRes.json()
                  // console.log("currentTrack", currentTrackInfo)
                  queue[0].tracks.shift()
                }

              } else{
                console.log("currentTrack is empty in db. grabbing currTrack from currPlaylist")
                currTrack = currentPlaylist.tracks[0]
                // const trackRes = await fetch("/api/getTrack/" + currTrack, {method: "GET"})
                // currentTrackInfo = await trackRes.json()
                // console.log("currentTrack", currentTrackInfo)
                currentPlaylist.tracks.shift()
              }
            } else{
              // const trackRes = await fetch("/api/getTrack/" + userQueueInfo.currentTrack, {method: "GET"})
              // currentTrackInfo = await trackRes.json()
              // console.log("currentTrack", currentTrackInfo)
              currTrack = userQueueInfo.currentTrack
              
            }
            
            QueueStore.dispatch(
              storeQueueInfo({
                currentTrack: currTrack,
                currentPlaylist: currentPlaylist,
                queue: queue
              })
            )
      }

      if (userSession.session_id && userSession.email) {
        // console.log("UserSession: ", userSession)
        validateUserSession(userSession.session_id, userSession.email);
      } 
      getQueue(userSession.email)
    }, []);
    // let queueInfo = useSelector(state => state)
    // console.log(queueInfo)
    const getQueueInfoRedux = () =>{
      // console.log("getQueueInfo result", queueInfo)
      const currStore =QueueStore.getState()
      console.log(currStore)

    }

    const getCurrentTrackRedux = () =>{
      // console.log("getQueueInfo result", queueInfo)
      const currStore =QueueStore.getState()
      console.log(currStore.QueueInfo.currentTrack)

    }

    const pushNextTrackRedux = () =>{
      QueueStore.dispatch(
        pushNextTrack()
      )
    }
    const replaceCurrentTrackRedux = (track) =>{
      QueueStore.dispatch(
        replaceCurrentTrack(track)
      )
    }
    const addPlaylistToQueueRedux = (newPlaylist) =>{
      QueueStore.dispatch(
        addPlaylistToQueue(newPlaylist)
      )
    }
    const clearCurrentPlaylistRedux = () =>{
      QueueStore.dispatch(
        clearCurrentPlaylist()
      )
    }
    const removeTrackFromCurrentPlaylistRedux = (trackID, index) =>{
      QueueStore.dispatch(
        removeTrackFromCurrentPlaylist(trackID, index)
      )
    }
    const removePlaylistFromQueueRedux = (playlistID) =>{
      QueueStore.dispatch(
        removePlaylistFromQueue(playlistID)
      )
    }
    const removeTrackFromQueueRedux = (playlistID, trackID, index) =>{
      QueueStore.dispatch(
        removeTrackFromQueue(playlistID, trackID, index)
      )
    }

    const newTrack = "reduxNewTrackID1"

    const newPlaylist = {
      playlistID: "reduxNewPlaylistID1",
      playlistName: "reduxNewPlaylistID1",
      tracks: [
        "reduxNewTrackID2", 
        "reduxNewTrackID3",
        "reduxNewTrackID4"
      ]
    }

    return (
  
      <Layout>
        <div className="page-container">
          {isEmpty(user)
              ? <div></div>
              : <Sidebar user={user}></Sidebar>
            }
            <div className="main-page">
                {isEmpty(user)
                    ? <div></div>
                    : <CustomNavbar user={user} />
                }
                <div className="heading">
                    <h1> Queue </h1>
                </div>
                <button onClick={getQueueInfoRedux}>GET_QUEUE_INFO</button>
                <button onClick={getCurrentTrackRedux}>get current track</button>
                <button onClick={pushNextTrackRedux}>PUSH_NEXT_TRACK</button>
                <button onClick={() => replaceCurrentTrackRedux("reduxNewTrackID1")}>REPLACE_CURRENT_TRACK</button>
                <button onClick={() => addPlaylistToQueueRedux(newPlaylist)}>ADD_PLAYLIST_TO_QUEUE</button>
                <button onClick={() => removeTrackFromCurrentPlaylistRedux("1UhNCFznoAsGHuLF8NcE", 1)}>REMOVE_TRACK_FROM_CURRENT_PLAYLIST</button>
                <button onClick={clearCurrentPlaylistRedux}>CLEAR_CURRENT_PLAYLIST</button>
                <button onClick={() => removeTrackFromQueueRedux("reduxNewPlaylistID1","reduxNewTrackID2", 0)}>REMOVE_TRACK_FROM_QUEUE</button>
                <button onClick={() => removePlaylistFromQueueRedux("reduxNewPlaylistID1")}>REMOVE_PLAYLIST_FROM_QUEUE</button>


                <style>{`
                .heading{
                text-align:center;
                }
                .main-page{
                width: 88%;
                margin-top:30px;
                margin-bottom:30px;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-content:center;
                align-text:center;
                align-self: flex-start;
                }
    
            .page-container{
                display: flex;
                height: 100%;
                
            }
            .button-container{
                margin:20px;
                text-align:center;
            }
            .image{
                -webkit-user-select: none;
                margin: auto;}
                .heading{
                text-align:center;
            }
            .musicPlayer{
                text-align:center;
                padding: 20px;
            }
            .grid-container{
                padding:20px;
                width: 80%;
                display: flex;
                justify-content:center;
                align-self:center;
                margin-right: 50px;
                margin-left:50px;
                max-width: 690px;
            }
            .navbar{
                display:flex;
                flex-direction: column;
                align-items: stretch;
            }
        `}</style>
            </div>
        </div>
        <div>
            <Provider store={AudioPlayerStore}>
                <AudioPlayerBarContainer />
            </Provider>
        </div>
        
      </Layout >
  
    )
  }

  Queue.getInitialProps = async ({ req }) => {
    const cookies = parseCookies(req)
    return {
      userSession: {
        "session_id": cookies.session_id,
        "email": cookies.email
      }
    };
  }
  
function mapStateToProps(state) {
  console.log("mapStateToProps", state)
  return state
}

const mapDispatchToProps = (dispatch) => ({
    // changeAudioPlayerInfo: AudioPlayerInfo => dispatch(storeAudioPlayerInfo(AudioPlayerInfo)),
    // togglePlaying: playing => dispatch(togglePlaying(playing))
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

// export default connect(mapStateToProps, mapDispatchToProps)(Queue)

export default Queue