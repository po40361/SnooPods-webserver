import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from "react-bootstrap"
import { server } from '../config';
import fetch from "isomorphic-unfetch";
import isEmpty from '../lib/isEmptyObject';
import useSWR from 'swr';



const Sidebar = (props) => {
    const [mounted, setMounted] = useState(false)
    const {data} = useSWR(mounted? "/api/user/getCollections/"+ props.user.email: null)
    useEffect(() => {
        setMounted(true)
      }, []);


    const renderCollections = (collection, index) => {
        return(
            <Nav.Link
                key={index} 
                style={{ 
                    paddingLeft: "25px", 
                    maxWidth: "100%",
                    flex: "1", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }} 
                onClick={() => { Router.push("/collection/"+collection.collectionID) 
            }}>{collection.collectionName}</Nav.Link>
        )
    }

    return (
        <Navbar className="sidebar" style={{
            backgroundColor: "#EAECEF",
            width: "14%",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Nav style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                maxWidth: "100%", 
            }}>
                <Nav.Link style={{  }} onClick={() => { Router.push("/") }}>Home</Nav.Link>
                <Nav.Link style={{  }} onClick={() => { Router.push("/") }}>Search</Nav.Link>
                <div style={{padding: "8px"}}>Your Collections</div>
                {/* <Nav.Link style={{ paddingLeft: "25px", maxWidth: "100%",flex: "1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => { Router.push("/") }}>Collection 1234567678</Nav.Link>
                <Nav.Link style={{ paddingLeft: "25px", maxWidth: "100%",flex: "1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => { Router.push("/") }}>Collection2131312312</Nav.Link> */}
                {data?.map(renderCollections)}
            </Nav>
                <style jsx>
                {``}
                </style>
        </Navbar>
    )

}

// Sidebar.getInitialProps = async () =>{
    
// }

export default Sidebar