import { createStore } from 'redux';
import registerReducer from "./reducers/registerReducer"
import AudioPlayerReducer from "./reducers/AudioPlayerReducer"
import QueueReducer from "./reducers/QueueReducer"
import userSessionInfoReducer from "./reducers/userSessionInfoReducer"
import collectionReducer from "./reducers/CollectionReducer"
import LikedTracksReducer from './reducers/LikedTracksReducer';

export const RegisterStore = createStore(registerReducer);

export const AudioPlayerStore = createStore(AudioPlayerReducer);

export const QueueStore = createStore(QueueReducer);

export const UserSessionStore = createStore(userSessionInfoReducer);

export const CollectionStore = createStore(collectionReducer)

export const LikedTracksStore = createStore(LikedTracksReducer)


module.exports = {
    RegisterStore,
    AudioPlayerStore,
    QueueStore,
    UserSessionStore,
    CollectionStore,
    LikedTracksStore
};

// const store = createStore(rootReducer);

// export default store;