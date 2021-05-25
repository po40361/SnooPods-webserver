const storeUserInfo = (userInfo) => {
    return {
        type: "STORE_USER_INFO",
        userInfo
    }
}

const storeAudioPlayerInfo = (AudioPlayerInfo) => {
    return {
        type: "STORE_AUDIO_PLAYER_INFO",
        AudioPlayerInfo
    }
}

const togglePlaying = (playingStatus) => {
    return {
        type: "TOGGLE_PLAYING",
        playingStatus
    }
}

const setAudioStoreEmail = (email) => {
    return {
        type: "SET_AUDIO_STORE_EMAIL",
        email
    }
}

const nextTrack = (AudioPlayerInfo) => {
    return {
        type: "NEXT_TRACK",
        AudioPlayerInfo
    }
}

module.exports = { storeUserInfo, storeAudioPlayerInfo, togglePlaying, nextTrack, setAudioStoreEmail }