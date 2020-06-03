const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'eternal-arcana-275612',
    keyFilename: '../web-server/credentials/read-write credentials/eternal-arcana-275612-2a726e49cb23.json',
});

async function getPodcast(subreddit, podcast) {
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
}

async function getUser(email) {
    console.log("getting user by email...")
    // console.log(email)
    let userRef = db.collection("users")
    let snapshot = await userRef.doc(email).get()
    console.log("snapshot", snapshot)
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

async function createUser(user) {
    let userRef = db.collection("users").doc(user.email)
    console.log("creating user!")
    try {
        await userRef.set({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture_url: user.picture_url
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

const generateID = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

async function createSession(email) {
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

async function checkValidSession(sessionID, email) {
    let userRef = db.collection("users").doc(email)
    let user = await userRef.get()
    let data = user.data()
    if (sessionID === data.sessionID) {
        return true
    }
    else {
        return false
    }
}


module.exports = {
    getPodcast,
    getUser,
    createUser,
    createSession,
    checkValidSession
}