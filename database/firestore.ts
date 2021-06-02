// const Firestore = require('@google-cloud/firestore');
// import {Firestore} from "@google-cloud/firestore";
import {Timestamp, Track, Collection} from "../ts/interfaces"

var file = require("../credentials/read-write-credentials/snoopods-us-bd34eda00ba3.json")


// const db = new Firestore({
//     projectId: 'snoopods-us',
//     credentials: { client_email: file.client_email, private_key: file.private_key }
// });
const admin = require('firebase-admin');

const serviceAccount = require('../credentials/read-write-credentials/snoopods-us-bd34eda00ba3.json');

// admin.app().delete()
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}


const db = admin.firestore();

const emptyTrack : Track= {
    filename: "",
    cloud_storage_url: "",
    date_posted: {
        _seconds: 0,
        _nanoseconds: 0
    },
    audio_length: 0,
    track_name: "",
    track_id: ""
  }

export async function getPodcast(subreddit, podcast) {
    console.log("getPodcast executed")
    if (subreddit && podcast) {
        let podcastRef = db.collection("subreddits").doc(subreddit).collection('podcasts').doc(podcast + ".mp3");
        console.log("getting podcast")
        let doc = await podcastRef.get()
        console.log("podcastRef.get() executed")
        if (!doc.exists) {
            console.log('No such document!');
            return null
        } else {
            console.log('Document data:', doc.data());
            return doc.data()
        }
    }
    return
}

export async function getUser(email) {
    console.log("getting user by email...")
    // console.log(email)
    let userRef = db.collection("users")
    let snapshot = await userRef.doc(email).get()
    // console.log("snapshot", snapshot)
    try {
        if (!snapshot.exists) {
            console.log('User not found');
            return false;
        }
        else {
            console.log('User found')
            return true;
        }
    }
    catch (err) {
        console.log('Error getting user', err);
        return false
    }
}

export async function getTrack(trackID: string){
    let trackRef = db.collection("tracks").doc(trackID)
    let trackDoc = await trackRef.get()
    let trackData = trackDoc.data()
    let track:Track = {
        filename: trackData["filename"],
        cloud_storage_url: trackData["cloudStorageURL"],
        date_posted: trackData["datePosted"],
        audio_length: trackData["audioLength"],
        track_name: trackData["trackName"],
        track_id: trackData["trackID"]
    }
    return track
}

export async function createUser(user) {
    let userRef = db.collection("users").doc(user.email)
    console.log("creating user!")
    try {

        var likedTracksCollectionID = await createCollection("My Liked Tracks", user.email, [])

        await userRef.set({
            collections: [],
            currentPlaylist: {"playlistID": "", "playlistName": "", "tracks": []},
            currentTrack: emptyTrack,
            email: user.email,
            firstName: user.firstName,
            history: [],
            lastName: user.lastName,
            likedTracksCollectionID: likedTracksCollectionID,
            pictureURL: user.picture_url,
            queue: [],
            subscriptionLists: []
        })
        let sessionID = await createSession(user.email)

        
        return {
            sessionID: sessionID,
            email: user.email
        }
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function getUserCollections(email) {
    let userRef = db.collection("users").doc(email)
    console.log("getting user collections of", email)
    try {
        let userData = await userRef.get()
        userData = userData.data()
        let userCollections = userData.collections
        return userCollections
    } catch (e) {
        console.log(e)
        return null
    }
}


export async function getSingleUserCollection(email: string, collectionID: string) {
    let collectionRef = db.collection("collections").doc(collectionID)
    console.log("getting single collection", collectionID)
    try {
        let collectionData = await collectionRef.get()
        collectionData = collectionData.data()
        if(collectionData.ownerID == email){
            return {status: 200, collectionData: collectionData}
        } else{
            return {status: 403, collectionData: {}}
        }
        
    } catch (e) {
        console.log(e)
        return {status: 500, collectionData: {}}
    }
}

export async function getTracks(trackIDs: Array<string>) {

    let tracks : Array<Track> = []
    for (var i = 0; i < trackIDs.length; i++){
        let trackRef = db.collection("tracks").doc(trackIDs[i])
        try{
            let trackInfo = await trackRef.get()
            trackInfo = trackInfo.data()
            // console.log("trackInfo", trackInfo)
            let track: Track = {
                filename: trackInfo.filename,
                audio_length: trackInfo.audioLength,
                cloud_storage_url: trackInfo.cloudStorageURL,
                date_posted: trackInfo.datePosted,
                track_id: trackInfo.trackID,
                track_name: trackInfo.trackName
            }
            // console.log("track", track)
            tracks.push(track)
        } catch(e){
            console.error("error in getTracks", e)
            return {status: 500, tracks: []}
        }
    }
    return {status: 200, tracks: tracks}

}

export const addNewCollection = async(collectionName: string, email: string) => {
    let newCollectionID = await createCollection(collectionName, email, [])
    let userRef = db.collection("users").doc(email)
    try{
        // let userData = await userRef.get()
        // var newEntry = {"collectionID": newCollectionID, "collectionName": collectionName };
        // var newEntryString = JSON.stringify(newEntry)
        await userRef.update({
            collections: admin.firestore.FieldValue.arrayUnion({"collectionID": newCollectionID, "collectionName": collectionName})
        })
        return 200
    }catch(e){
        console.error("error in addNewCollection", e)
        return 500
    }

}

export const deleteCollection = async(collectionID: string, collectionName: string, email: string) => {
    console.log("deleteCollection for firestore got", email, collectionID)
    let userRef = db.collection("users").doc(email)  

    try{
        await userRef.update({collections:admin.firestore.FieldValue.arrayRemove({"collectionID": collectionID, "collectionName": collectionName}) })
    } catch(e){
        console.log("error in deleteCollection, deleting collection from user", e)
        return 500
    }
    try{
        let collectionRef = db.collection("collections").doc(collectionID)
        await collectionRef.delete()
    } catch(e){
        console.log("error in deleteCollection, deleting collection from collections", e)
        return 500
    }

    return 200
}

export const renameCollection = async(collectionID: string, newCollectionName: string, email: string ) => {
    let collectionRef = db.collection("collections").doc(collectionID)
    try{
        let collectionData = await collectionRef.get()
        collectionData = collectionData.data()
        if (collectionData.ownerID == email){
            await db.collection("collections").doc(collectionID).update({collectionName: newCollectionName})
            let userRef = db.collection("users").doc(email)
            let userData = await userRef.get()
            let userCollections = userData.data().collections
            
            for(var i = 0; i < userCollections.length; i ++){
                if (userCollections[i].collectionID == collectionID){
                    userCollections[i].collectionName = newCollectionName
                }
            }
            console.log("userCollections", userCollections)

            await db.collection("users").doc(email).update({collections: userCollections})

            return 200
        } else{
            return 403
        }
    } catch (e){
        console.error("error in renameCollection", e)
        return 500
    }
} 

export const addTrackToCollection = async(collectionID: string, newTrackID: string, email: string) => {
    let collectionRef = db.collection("collections").doc(collectionID)
    try{
        let collectionData = await collectionRef.get()
        collectionData = collectionData.data()
        
        console.log("ownerID:", collectionData.ownerID)
        if (collectionData.ownerID == email){
            collectionData.tracks.push(newTrackID)
            await db.collection("collections").doc(collectionID).set(
                collectionData
            )
            return 200

        } else{
            return 403
        }
    } catch (e){
        console.error("error in addTrackToCollection", e)
        return 500
    }
}

export const removeTrackFromCollection = async(collectionID: string, trackID: string, trackIndex: string, email: string) => {
    let collectionRef = db.collection("collections").doc(collectionID)
    try{
        let collectionData = await collectionRef.get()
        collectionData = collectionData.data()
        console.log("before remove track", collectionData.tracks)
        if (collectionData.ownerID == email){
            var newTrackArray = collectionData.tracks.filter((track, index) => {return track !== trackID || index !== trackIndex}  )
            collectionData.tracks = newTrackArray
            await db.collection("collections").doc(collectionID).set(
                collectionData
            )
            console.log("after remove track", collectionData.tracks)

            return 200

        } else{
            return 403
        }
    } catch (e){
        console.error("error in removeTrackFromCollection", e)
        return 500
    }
}

export const toggleUserLikedTracks = async (trackID: string, email: string) => {
    let userRef = db.collection("users").doc(email)
    console.log("toggeling", email+"'s liked tracks for trackID", trackID)
    try {
        let userData = await userRef.get()
        userData = userData.data()
        let userLikedTracksCollectionID = userData.likedTracksCollectionID
        let {collectionData: likedTracksCollection} = await getSingleUserCollection(email, userLikedTracksCollectionID)
        // console.log("liked tracks collectionData", likedTracksCollection)
        let likedTracks = likedTracksCollection.tracks
        if(likedTracks.includes(trackID)){
            likedTracks = likedTracks.filter((trackIDinArray) => {return trackIDinArray !== trackID} )
        } else{
            likedTracks.push(trackID)
        }

        let likedTracksCollectionRef = db.collection("collections").doc(likedTracksCollection.collectionID)
        await likedTracksCollectionRef.update({
            tracks: likedTracks
        })

        return 200
    } catch (e) {
        console.log("error in getUserLikedTracks" ,e)
        return 500
    }
}

export const getUserLikedTracks = async (email: string) => {
    let userRef = db.collection("users").doc(email)
    console.log("getting user liked tracks of", email)
    try {
        let userData = await userRef.get()
        userData = userData.data()
        let userLikedTracksCollectionID = userData.likedTracksCollectionID
        let {collectionData: likedTracks} = await getSingleUserCollection(email, userLikedTracksCollectionID)
        console.log("liked tracks collectionData", likedTracks)
        return {status: 200, likedTracks: likedTracks}
    } catch (e) {
        console.log("error in getUserLikedTracks" ,e)
        return {status: 500, likedTracks: {}}
    }
}

export const createCollection = async (collectionName: string, ownerID: string, tracks: Array<string>) => {
    // console.log("creating collection", collectionName)
    try{
        const res = await db.collection("collections").add({
            collectionID: "",
            collectionName: collectionName,
            ownerID: ownerID, 
            tracks: tracks
        })
        var key = res.id 
        await db.collection("collections").doc(res.id).update({collectionID: key})
        return key
    } catch(e){
        console.error("error in createCollection", e)
    }
}

const generateID = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export async function createSession(email) {
    const sessionID = generateID()
    let userRef = db.collection("users").doc(email)
    console.log("creating session")
    try {
        await userRef.set({
            sessionID: sessionID
        }, { merge: true })
        return sessionID
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function checkValidSession(sessionID: string, email: string) {
    let userRef = db.collection("users").doc(email)
    let user = await userRef.get()
    let data = user.data()
    if (sessionID === data.sessionID) {
        data.validSession = true;
    }
    else {
        data.validSession = false 
    }
    return data

}

export async function getFeaturedSubreddits() {
    let docRef = db.collection("subreddits")
    let featured = await docRef.get()
    return featured;
}

export async function getSubredditPlaylist(subID) {
    // console.log("subID in firestore:" + subID)
    let docRef = db.collection("subreddits").doc(subID)
    let doc = await docRef.get()

    let mainCollectionID: string = doc.data().mainCollectionID
    
    let collectionRef = db.collection("collections").doc(mainCollectionID)
    let collectionDoc = await collectionRef.get()
    let tracks : Array<string> = collectionDoc.data().tracks


    let collection = <Collection>{keys:[], tracks:{}};
    // console.log(doc)
    for (const [index, track_id] of tracks.entries()) {
        let trackRef = db.collection("tracks").doc(track_id)
        let trackDoc = await trackRef.get()

        
        // console.log(doc.id, '=>', doc.data());
        let trackData = trackDoc.data()
        let track:Track = {
            filename: trackData["filename"],
            cloud_storage_url: trackData["cloudStorageURL"],
            date_posted: trackData["datePosted"],
            audio_length: trackData["audioLength"],
            track_name: trackData["trackName"],
            track_id: trackData["trackID"]
        }

        // console.log(track)
        // console.log(collection)
        collection["keys"].push(track_id)
        collection["tracks"][track_id] = track

    }
    // collection
    // console.log("doc", doc)

    let subredditsDocRef = db.collection("subreddits").doc(subID)
    let subredditsDoc = await subredditsDocRef.get()
    if (!subredditsDoc.exists) {
        console.log("No album picture found")
    } else {
        collection["cover_url"] = subredditsDoc.data()["pictureURL"]
    }
    // console.log("collection info:", collection)
    return collection

    // if (!doc.exists) {
    //     console.log('No such document!');
    //     return null
    // } else {
    //     console.log('Document data:', doc.data());
    //     return doc.data()
    // }

}

export async function getQueue(email: string){
    // console.log("email in getQueue", email)
    let userRef = db.collection("users").doc(email)
    try {
        
        let userData = await userRef.get()
        userData = userData.data()
        return {currentTrack: userData.currentTrack, currentPlaylist: userData.currentPlaylist, queue: userData.queue}
        
    } catch (error) {
        console.error("error in getQueue", error)
        
    }

}

export async function pushQueueToDB(email: string, queueInfo: Object){
    // console.log("pushQueueToDB:", email, queueInfo)
    let userRef = db.collection("users").doc(email)
    try {
        
        await userRef.update({currentPlaylist: queueInfo["currentPlaylist"]})
        await userRef.update({queue: queueInfo["queue"]})
        await userRef.update({currentTrack: queueInfo["currentTrack"]})
        return 200
    } catch (error) {
        console.error("error in pushQueueToDB", error)  
        return 500
    }

}

export async function getUserSubLists(email: string){
    let userRef = db.collection("users").doc(email)
    console.log("getting user sublists of", email)
    try {
        let userData = await userRef.get()
        userData = userData.data()
        let userSubLists = userData.subscriptionLists
        return userSubLists
    } catch (e) {
        console.log(e)
        return null
    }

}

export async function getSingleUserSubList(email: string, subListID: string){
    let subListRef = db.collection("subscriptionLists").doc(subListID)
    console.log("getting single subList", subListID)
    try {
        let subListData = await subListRef.get()
        subListData = subListData.data()
        // console.log("subListData", subListData)
        if(subListData.ownerID == email){
            return {status: 200, subListData: subListData}
        } else{
            return {status: 403, subListData: {}}
        }
        
    } catch (e) {
        console.log("error in getSingleUserSublists", e)
        return {status: 500, subListData: {}}
    }

}

export async function getSubListCollections(latestCollectionsIDs: Array<string>){

    try{

        let collections = []
        console.log("latestCollectionsIDs", latestCollectionsIDs)
        for(var i = 0; i < latestCollectionsIDs.length; i++){
            let singleCollectionRes = await getSingleUserCollection("admin", latestCollectionsIDs[i])
            if(singleCollectionRes.status == 200){
                let collectionData = singleCollectionRes.collectionData
                let getTracksRes = await getTracks(collectionData.tracks)
                collectionData.tracks = getTracksRes.tracks

                collections.push(collectionData)
            } else{
                return {status: 500, subListCollections: []}
            }
        }

        return {status: 200, subListCollections: collections} 
        
    } catch (e) {
        console.error("error in getSubListCollections", e)
    }

    
}

export async function addNewSubList(subListName: string, email: string){
    let newSubListID = await createSubList(subListName, email, [])
    let userRef = db.collection("users").doc(email)
    try{

        await userRef.update({
            subscriptionLists: admin.firestore.FieldValue.arrayUnion({"subscriptionListID": newSubListID, "subscriptionListName": subListName})
        })
        return 200
    }catch(e){
        console.error("error in addNewCollection", e)
        return 500
    }
}

const createSubList = async (subListName: string, ownerID: string, subredditNewlyUpdatedCollectionIDs: Array<string>) => {
    try{
        const res = await db.collection("subscriptionLists").add({
            subscriptionListID: "",
            subscriptionListName: subListName,
            ownerID: ownerID, 
            latestCollectionsFromSubreddits: subredditNewlyUpdatedCollectionIDs
        })
        var key = res.id 
        await db.collection("subscriptionLists").doc(res.id).update({subscriptionListID: key})
        return key
    } catch(e){
        console.error("error in createSubList", e)
    }
}

export async function deleteSubList( subListID: string,subListName: string, email: string){
    console.log("deleteSubList for firestore got", email,",", subListID,",", subListName)
    let userRef = db.collection("users").doc(email)  

    try{
        await userRef.update({subscriptionLists :admin.firestore.FieldValue.arrayRemove({"subscriptionListID": subListID, "subscriptionListName": subListName}) })
    } catch(e){
        console.log("error in deleteSubList, deleting subList from user", e)
        return 500
    }
    try{
        let subListRef = db.collection("subscriptionLists").doc(subListID)
        await subListRef.delete()
    } catch(e){
        console.log("error in deleteSubList, deleting subList from subscriptionLists", e)
        return 500
    }

    return 200
}

export async function renameSubList(newSubListName: string, subListID: string, email: string){
    let subListRef = db.collection("subscriptionLists").doc(subListID)
    try{
        let subListData = await subListRef.get()
        subListData = subListData.data()
        if (subListData.ownerID == email){
            await db.collection("subscriptionLists").doc(subListID).update({subscriptionListName: newSubListName})
            let userRef = db.collection("users").doc(email)
            let userData = await userRef.get()
            let userSubLists = userData.data().subscriptionLists
            
            for(var i = 0; i < userSubLists.length; i ++){
                if (userSubLists[i].subscriptionListID == subListID){
                    userSubLists[i].subscriptionListName = newSubListName
                }
            }
            console.log("userSubLists", userSubLists)

            await db.collection("users").doc(email).update({subscriptionLists: userSubLists})

            return 200
        } else{
            return 403
        }
    } catch (e){
        console.error("error in renameSubList", e)
        return 500
    }

}

export async function addSubToSubList(subListID: string,  newSubID: string, email: string){
    let subListRef = db.collection("subscriptionLists").doc(subListID)

    let subredditRef = db.collection("subreddits").doc(newSubID)
    
    try{

        let subredditData = await subredditRef.get()
        subredditData = subredditData.data()
        let newSubCollectionID = subredditData.newestUpdatesCollectionID

        let subListData = await subListRef.get()
        subListData = subListData.data()
        
        console.log("ownerID:", subListData.ownerID)
        if (subListData.ownerID == email){
            subListData.latestCollectionsFromSubreddits.push(newSubCollectionID)
            await db.collection("subscriptionLists").doc(subListID).set(
                subListData
            )
            return 200

        } else{
            return 403
        }
    } catch (e){
        console.error("error in addSubToSubList", e)
        return 500
    }
}

export async function removeSubFromSubList(subListID: string, subCollectionID: string, email: string){
    let subListRef = db.collection("subscriptionLists").doc(subListID)

    // let subredditRef = db.collection("subreddits").doc(subID)

    try{
        // let subredditData = await subredditRef.get()
        // subredditData = subredditData.data()
        // let subCollectionID = subredditData.newestUpdatesCollectionID

        let subListData = await subListRef.get()
        subListData = subListData.data()
        
        console.log("ownerID:", subListData.ownerID)
        if (subListData.ownerID == email){
            var newSubredditsArray = subListData.latestCollectionsFromSubreddits.filter(
                (collectionID: string) => {return collectionID !== subCollectionID }  
            )
            subListData.latestCollectionsFromSubreddits = newSubredditsArray
            await db.collection("subscriptionLists").doc(subListID).set(
                subListData
            )
            return 200

        } else{
            return 403
        }
    } catch (e){
        console.error("error in addSubToSubList", e)
        return 500
    }
}

module.exports = {
    getPodcast,
    getUser,
    createUser,
    createSession,
    checkValidSession,
    getFeaturedSubreddits,
    getSubredditPlaylist,
    getUserCollections,
    getSingleUserCollection,
    getTracks,
    addNewCollection, 
    deleteCollection,
    getQueue,
    getTrack,
    pushQueueToDB,
    renameCollection, 
    addTrackToCollection, 
    removeTrackFromCollection,
    getUserLikedTracks,
    toggleUserLikedTracks,
    getUserSubLists,
    getSingleUserSubList,
    getSubListCollections,
    addNewSubList,
    deleteSubList,
    renameSubList,
    addSubToSubList,
    removeSubFromSubList
}