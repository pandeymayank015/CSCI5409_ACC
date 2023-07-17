import React from 'react';
import {getUser, resetUserSession} from './service/AuthService'
const PremiumContent = (props) => {
const user =getUser();
const name = user !=='undefined' && user ? user.name: "";
const logoutHandler=()=>{
    resetUserSession();
    props.history.push('/login');
}
    return (
        <div>
            Hello {name}!
            <input type= "button" value="logout" onClick={logoutHandler}/>

        </div>
    )
}
export default PremiumContent;