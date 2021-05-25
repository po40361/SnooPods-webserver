import { storeRegisterationInfo } from "../actions/index"

const initialState = {
    userInfo: {}
}


const registerReducer = (state = initialState, action) => {
    switch (action.type) {
        case "STORE_REGISTERATION_INFO":
            return Object.assign({}, state, {
                registered: action.userInfo.registered,
                payload: action.userInfo.verification.payload,
                userID: action.userInfo.userID
            })
        default:
            return state
    }
}

export default registerReducer