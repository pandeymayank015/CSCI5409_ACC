import {Redirect, Route} from "react-router-dom";
import React from 'react';
import {getToken} from "../service/AuthService";

const PublicRoute =({component: Component, ...rest})=>{
    return(
        <Route
            {... rest}
            render={props=>{
                return !getToken() ? <Component {...props} />
                    : <Redirect to={{pathname: '/premium-content'}} />
            }}
        />
    )
}
export default PublicRoute