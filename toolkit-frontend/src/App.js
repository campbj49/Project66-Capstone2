import React, { useState, useEffect } from "react";
import { Router as BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import NavBar from "./NavBar";
import { Route, Switch, useHistory } from "react-router-dom";
import List from "./List";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm.js";
import ToolkitApi from "./api";
import { createBrowserHistory } from 'history';
import useLocalStorage from "./useLocalStorage";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

function App() {
  const [user, setUser] = useState({});
  const [error, setError] = useState();
  const browserHistory = createBrowserHistory();
  const history = useHistory();
  console.log(browserHistory);

  return (
    <div className="App">
      <BrowserRouter history={browserHistory}>
        <NavBar error = {error}/>
        <main>
          <Switch>
            <Route exact path="/">
              <Home token={user.token}/>
            </Route>
            <Route path="/logout">
              <Logout browserHistory={browserHistory} 
                      history={history}
                      setUser={setUser}/>
            </Route>
            <Route path="/login">
            <LoginForm setError={setError}
                    setUser={setUser}
                    browserHistory={browserHistory} />
            </Route>
            <Route path="/signup">
            <SignupForm setError={setError}
                    setUser={setUser}/>
            </Route>
            <Route>
              <p>Hmmm. I can't seem to find what you want.</p>
            </Route>
          </Switch>
        </main>
      </BrowserRouter>
    </div>
  );
}

//mini component for logging out
function Logout({browserHistory, setUser, history}){
  //setUser({});
  //ToolkitApi.token = undefined;
  //history.push("/");
  return <Redirect to="/"/>
}

export default App;
