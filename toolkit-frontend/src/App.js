import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import NavBar from "./NavBar";
import { Route, Switch, useHistory } from "react-router-dom";
import List from "./List";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm.js";
import ToolkitApi from "./api";
import useLocalStorage from "./useLocalStorage";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

function App() {
  const [user, setUser] = useState({});
  const [error, setError] = useState();

  return (
    <div className="App">
      <BrowserRouter>
        <NavBar error = {error} user = {user}/>
        <main>
          <Switch>
            <Route exact path="/">
              <Home token={user.token}/>
            </Route>
            <Route path="/logout">
              <Logout setUser={setUser}/>
            </Route>
            <Route path="/login">
            <LoginForm setError={setError}
                    setUser={setUser}
                    user = {user} />
            </Route>
            <Route path="/signup">
            <SignupForm setError={setError}
                    setUser={setUser}
                    user = {user}/>
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
function Logout({setUser}){

  //wrap information clear in effect to prevent infinite loop
  useEffect(()=>{
    console.log("The variables have been cleared")
    setUser({});
    ToolkitApi.token = undefined;
  },[])
  return <Redirect to="/"/>;
}

export default App;
