import { Redirect, Route } from 'react-router-dom';
import React from 'react';

const getEmail = () => JSON.parse(sessionStorage.getItem('user'))?.email;

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return getEmail() ? <Component {...props} />
          : <Redirect to={{pathname: '/login'}} />
      }}
    />
  );
}

export default PrivateRoute;
