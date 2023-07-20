import { BrowserRouter, NavLink, Route, Switch } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import PremiumContent from "./PremiumContent";
import { useEffect, useState } from "react";
import { getUser, getToken, setUserSession, resetUserSession } from "./service/AuthService";
import axios from "axios";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

const verifyTokenAPIURL = "https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/verify"
function App() {
    const [isAuthenticating, setAuthenticating] = useState(true);
    useEffect(()=>{
        const token=getToken();
        if (token==='undefined'|| token === undefined || token === null || !token){
            return;
        }
        const requestConfig = {
            headers: {
                'x-api-key': 'z4RHzesbGa7yo0IEGP1n18DuLtfnzEdn6N1QwvyV',
            }
        }
        const requestBody= {
            user: getUser(),
            token: token
        }
        axios.post(verifyTokenAPIURL,requestBody, requestConfig).then(response =>{
            setUserSession(response.data.user, response.data.token);
            setAuthenticating(false);
        }).catch(()=>{
                resetUserSession();
                setAuthenticating(false);

            }
        )
    },[]);
    const token = getToken();
    if (isAuthenticating && token){
        return <div>Authenticating ...</div>
    }
    return (
        <div className="App">
            <BrowserRouter>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component={NavLink} to="/" color="inherit" style={{ textDecoration: 'none', marginRight: '16px' }}>
                            BookAvengers
                        </Typography>
                        <Button component={NavLink} to="/" color="inherit" activeClassName="active" style={{ textDecoration: 'none', marginRight: '16px' }}>
                            Home
                        </Button>
                        <Button component={NavLink} to="/register" color="inherit" activeClassName="active" style={{ textDecoration: 'none', marginRight: '16px' }}>
                            Register
                        </Button>
                        <Button component={NavLink} to="/login" color="inherit" activeClassName="active" style={{ textDecoration: 'none', marginRight: '16px' }}>
                            Login
                        </Button>
                        <Button component={NavLink} to="/premium-content" color="inherit" activeClassName="active" style={{ textDecoration: 'none' }}>
                            Library
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="md" style={{ marginTop: '20px' }}>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <PublicRoute path="/register" component={Register} />
                        <PublicRoute path="/login" component={Login} />
                        <PrivateRoute path="/premium-content" component={PremiumContent} />
                    </Switch>
                </Container>
            </BrowserRouter>
        </div>
    );
    }
export default App;
