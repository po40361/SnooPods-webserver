import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Image, Dropdown } from 'react-bootstrap/'
import React, { useState, useEffect } from "react"
import ProfilePicMenu from "../../ProfilePicMenu"
import { useGoogleLogout, GoogleLogout } from 'react-google-login';
import { CLIENT_ID } from "../../../lib/constants"
import Router from "next/router"
import useWindowDimensions from "../../hooks/useWindowDimensions"
import Collapse from 'react-bootstrap/Collapse'
import store from "../../../redux/store"
import { emptyAudioStore, emptyRegisterationInfo, storeRegisterationInfo } from "../../../redux/actions/index"

import GoogleLogin from 'react-google-login';
import { Divider } from '@material-ui/core';

import Cookie from "js-cookie"
import isEmpty from '../../../lib/isEmptyObject';
import { emptyQueue } from '../../../redux/actions/queueActions';
import {emptyUserSessionInfo} from "../../../redux/actions/userSessionActions"
import {emptyCollections} from "../../../redux/actions/collectionActions"
import {emptyLikedTracks} from "../../../redux/actions/likedTracksActions"
import {emptySubLists} from "../../../redux/actions/SubListActions"

const LoginGroup = (props) => {

    return (
        // <div>
        //     <Nav style={{ whiteSpace: "nowrap" }}>

        <Nav style={{ whiteSpace: "nowrap" }}>
            <NavDropdown
                id="login-dropdown"
                title="Login"
                // id="basic-nav-dropdown"
                renderMenuOnMount={true}
                alignRight
                style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    paddingLeft: props.paddingLeft
                }}>

                <GoogleLogin
                    clientId={CLIENT_ID}
                    render={renderProps => (
                        <Nav>
                            <NavDropdown.Item
                                style={{
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-around"
                                }}
                                onClick={renderProps.onClick}
                                disabled={renderProps.disabled}>
                                <img
                                    src={"https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png"}
                                    width="20" height="20"></img>
                                <div style={{ paddingLeft: "10px" }}>Sign In with Google</div>
                            </NavDropdown.Item>
                        </Nav>

                    )}
                    buttonText="Sign In with Google"
                    onSuccess={onGoogleLoginSuccess}
                    onFailure={onGoogleLoginFailed}
                    cookiePolicy={'single_host_origin'}
                />
            </NavDropdown>
        </Nav>
    )
}

async function onGoogleLoginSuccess(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;

    let response = await fetch("/api/user/verifyGoogleSession/" + id_token, { method: "GET" })
    if (response.status == 200) {
        let res = await response.json()
        if (res.registered) {
            //store session_id
            Cookie.set("session_id", res.session_id)
            Cookie.set("email", res.verification.payload.email)

            console.log("Taking user to their homepage")
            Router.push('/home')
        }
        else if (!res.registered) {
            // res.userID = id_token
            console.log("response in index.js", res)
            // const store = createStore(registerReducer)

            store.dispatch(storeRegisterationInfo(res))
            // console.log("store: ", store.getState())
            console.log("Taking user to registeration page ")
            Router.push('/register')
        }
    }
    else {
        console.log("Login Failed")
    }
}

const onGoogleLoginFailed = (response) => {
    console.log("Google login failed", response)
}

export default LoginGroup