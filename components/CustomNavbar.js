import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Image, Dropdown } from 'react-bootstrap/'
import React from "react"
import store from "../redux/store"
import ProfilePicMenu from "../components/ProfilePicMenu"
import { useGoogleLogout, GoogleLogout } from 'react-google-login';
import { CLIENT_ID } from "../lib/constants"
import Router from "next/router"
import useWindowDimensions from "../components/hooks/useWindowDimensions"

import GoogleLogin from 'react-google-login';

// const Navbar = (props) => {


// }

// export default Navbar;


// import { Row, Col, Form } from 'react-bootstrap/'
// // import Col from 'react-bootstrap/Form'
// import Button from 'react-bootstrap/Button'
// import React, { useState } from 'react';
// import Router from "next/router"
// import store from "../redux/store"
import Cookie from "js-cookie"

const logout = () => {
    // console.log("Logout clicked")
    Cookie.remove("session_id")
    Cookie.remove("email")
    Router.push("/")

}
const logoutFailed = () => {
    console.log("logout failed")
}

const ProfilePicGroup = (props) => {
    return (
        <div className="profile-pic-group">
            <Nav style={{ whiteSpace: "nowrap" }}>
                <Image src={props.user.picture_url} roundedCircle style={{ width: "40px", height: "40px" }} />
                <NavDropdown title={props.user.firstName} id="basic-nav-dropdown">
                    <GoogleLogout
                        clientId={CLIENT_ID}
                        render={renderProps => (
                            <NavDropdown.Item onClick={renderProps.onClick} disabled={renderProps.disabled}>Log Out</NavDropdown.Item>
                        )}
                        buttonText="custom logout"
                        onLogoutSuccess={logout}
                        onFailure={logoutFailed}
                        cookiePolicy={'single_host_origin'}
                    />

                    <NavDropdown.Item >Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown>
            </Nav>
        </div>
    )
}

const LoginGroup = () => {
    return (
        <div>
            <Nav style={{ whiteSpace: "nowrap" }}>
                <NavDropdown title="Login" id="basic-nav-dropdown">
                    <GoogleLogin
                        clientId={CLIENT_ID}
                        buttonText="Sign In with Google"
                        onSuccess={onGoogleLoginSuccess}
                        onFailure={onGoogleLoginFailed}
                        cookiePolicy={'single_host_origin'}
                    />
                </NavDropdown>
            </Nav>
        </div>
    )
}

async function onGoogleLoginSuccess(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;

    let response = await fetch("/api/user/" + id_token, { method: "GET" }, { revalidateOnMount: false })
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
            // const store = createStore(userInfoReducer)

            RegisterStore.dispatch(storeUserInfo(res))
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

}

const NavBarContent = (props) => {
    const { height, width } = useWindowDimensions();
    console.log("props in navbarcontent", props)
    if (width <= 991) {
        return (
            <Navbar bg="light" expand="lg" fixed="top" >

                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Navbar.Brand style={{ cursor: "pointer" }} onClick={() => { Router.push("/home") }}>SnooPods</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                </div>
                <Navbar.Collapse id="responsive-navbar-nav">

                    <Nav className="m-auto">


                        <div className="center-button">
                            <Nav.Link onClick={() => { Router.push("/home") }}>Home</Nav.Link>
                        </div>
                        <div className="center-button">
                            <Nav.Link href="#link">Browse</Nav.Link>
                        </div>
                        <div className="center-button">
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </div>
                    </Nav>
                    <div style={{ marginRight: "auto" }}>
                        {props.user
                            ? <ProfilePicGroup user={props.user} />
                            : <LoginGroup />
                        }
                    </div>
                </Navbar.Collapse>
            </Navbar>
        )
    }
    else {
        return (
            <Navbar bg="light" expand="lg" fixed="top" >

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                <Navbar.Collapse id="responsive-navbar-nav">
                    <div className="brand" style={{ marginLeft: "auto" }}>
                        <Navbar.Brand style={{ cursor: "pointer" }} onClick={() => { Router.push("/home") }}>SnooPods</Navbar.Brand>
                    </div>
                    <Nav className="m-auto">


                        <div className="center-button">
                            <Nav.Link onClick={() => { Router.push("/home") }}>Home</Nav.Link>
                        </div>
                        <div className="center-button">
                            <Nav.Link href="#link">Browse</Nav.Link>
                        </div>
                        <div className="center-button">
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </div>
                    </Nav>
                    <div style={{ marginRight: "auto" }}>
                        {props.user
                            ? <ProfilePicGroup user={props.user} />
                            : <LoginGroup />
                        }
                    </div>

                </Navbar.Collapse>
            </Navbar>
        )
    }

}

class CustomNavbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.user
    }



    render() {
        return (
            // dropdown customization: https://react-bootstrap.github.io/components/dropdowns/
            <div>
                {/* <div style={{ display: "flex", justifyContent: "space-around" }}> */}
                <NavBarContent user={this.state} />



                <style jsx> {`
                .parent{
                    display:flex;   
                }
                .navbar-content{
                    display:flex;
                    justify-content:center;
                }
                .navbar-content-container{
                    display:flex;
                    justify-content:center;
                }
                .center-button{
                    padding-left: 10px;
                    padding-right: 10px;
                    padding-top:5px;
                    padding-bottom:5px;

                }
                .brand{
                    margin-left:auto;


                }
                .profile-pic-group{
                    margin-right:auto;
                }
                .profile-pic-button{
                    padding: unset;
                }
                
                
                `}</style>
            </div >
        )
    }
}

export default CustomNavbar