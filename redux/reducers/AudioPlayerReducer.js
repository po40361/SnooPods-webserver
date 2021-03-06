
const emptyAudioStore = {
    playing: false,
    filename: "",
    trackName: "",
    audio: "",
    url: "",
    email: "",
    subreddit: "",
    picture_url:""
}

const initialState = emptyAudioStore

const audioPlayerInfoReducer = (state = initialState, action) => {
    // console.log("action:", action)
    switch (action.type) {
        case "STORE_AUDIO_PLAYER_INFO":
            return Object.assign({}, state, {
                playing: action.AudioPlayerInfo.playing,
                filename: action.AudioPlayerInfo.filename,
                trackName: action.AudioPlayerInfo.trackName,
                audio: action.AudioPlayerInfo.audio,
                url: action.AudioPlayerInfo.url,
                subreddit: action.AudioPlayerInfo.subreddit,
                picture_url: action.AudioPlayerInfo.pictureURL,
                
            })
        case "TOGGLE_PLAYING":
            // console.log("state in AudioPlayerReducer", state)
            return {
                ...state,
                playing: action.playingStatus
            }
        case "NEXT_TRACK":
            return {
                ...state
            }

        case "SET_AUDIO_STORE_EMAIL":
            return {
                ...state,
                email: action.email.email
            }

        case "EMPTY_AUDIO_STORE":
            return emptyAudioStore   
            
        
        default:
            return state
    }
}

export default audioPlayerInfoReducer;

// const registerReducer = (state = initialState, action) => {
//     switch (action.type) {
//         case "STORE_USER_INFO":
//             return Object.assign({}, state, {
//                 registered: action.userInfo.registered,
//                 payload: action.userInfo.verification.payload,
//                 userID: action.userInfo.userID
//             })
//         default:
//             return state
//     }
// }

// export default registerReducer
