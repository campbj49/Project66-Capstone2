import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import NavBar from "./NavBar";
import { Route, Switch } from "react-router-dom";
import List from "./List";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm.js";
import ToolkitApi from "./api";
import { createBrowserHistory } from 'history';
import useLocalStorage from "./useLocalStorage";

function App() {
  const [formData, setFormData] = useState({});
  const [token, setToken] = useLocalStorage("token");
  const [username, setUsername] = useLocalStorage("username");
  const [user, setUser] = useState({});
  const [error, setError] = useState();
  const browserHistory = createBrowserHistory();

  //keep user information up to date by loading the data fresh every time
  useEffect(()=>{
    async function updateUser(){
      if(!(username === "undefined" || !username)){
        ToolkitApi.token = token;
        await setUser(await ToolkitApi.getUser(username))
      }
    }
    updateUser();
  },[])

  //function for manaing the submission login and registration form
  async function onSubmit(evt){
    evt.preventDefault();
    try{
      if(!formData.username) setUser(await ToolkitApi.updateUser(username,formData))
      else{
        setToken();
        await setUsername(formData.username);
        console.log(username);
        console.log(formData.username);
        if(formData.email)
          await setToken(await ToolkitApi.signup(formData));
        else
          await setToken(await ToolkitApi.login(formData.username, formData.password));
        ToolkitApi.token = await ToolkitApi.login(formData.username, formData.password);
        setUser(await ToolkitApi.getUser(formData.username))
      }
      setError();
    }
    catch(err){
      console.log(err);
      setError("Invalid username or password")
    }
    
    setFormData({});
    browserHistory.push(`/`);
  }

  return (
    <div className="App">
      <BrowserRouter history={browserHistory}>
        <NavBar error = {error}/>
        <main>
          <Switch>
            <Route exact path="/">
              <Home token={token}/>
            </Route>
            <Route path="/logout">
              <Logout setToken={setToken} 
                      history={browserHistory} 
                      setUser={setUser}
                      setUsername={setUsername}/>
            </Route>
            <Route path="/login">
            <LoginForm onSubmit={onSubmit} 
                    setFormData={setFormData}/>
            </Route>
            <Route path="/signup">
            <SignupForm onSubmit={onSubmit} 
                    setFormData={setFormData}/>
            </Route>
            <Route exact path="/:base" token={token}>
              <List token={token}/>
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
function Logout({setToken, history, setUser, setUsername}){
  setToken();
  setUser();
  setUsername();
  ToolkitApi.token = undefined;
  history.push("/");
}

export default App;
