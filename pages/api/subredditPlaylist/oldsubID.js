import firestore from "../../../database/firestore"

export default async function handler(req, res) {

    if (req.method === "GET") {
        if (req.query["subID"]) {
            console.log("this is my req:", req.query)
            console.log("req.query:" + req.query["subID"])
            let playlist = await firestore.getSubredditPlaylist(req.query["subID"])
            // console.log("playlist", playlist)
            res.status(200).json(playlist)

        }
    }
}