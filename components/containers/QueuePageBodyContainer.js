import { connect } from "react-redux"
import QueuePageBody from "../Queue/QueuePageBody.tsx"

// const mapStateToProps = (state) => ({
//     AudioPlayerInfo: getAudioPlayerStatus()
// })

function mapStateToProps(state, ownProps) {
    // console.log("mapStateToProps", state)
    return state
}

const mapDispatchToProps = (dispatch) => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(QueuePageBody)