import { useState } from "react";
import ToolkitApi from "./api";
/**
 * LoginForm: Creates and handles the form for getting a user into the website itself
 * 
 * Props: 
 * -onSubmit: function for passing the form data up to the parent
 * -formData: state for passing form data to parent
 * 
 * States:
 * -message: current value typed into the form
 * 
 * App --> LoginForm
 */

function LoginForm({setToken, setUser, setError, setUsername, formVisible}){
    const [formData, setFormData] = useState({});
    //keeps input val props up to date
    const handleChange = evt => {
        const [ name, value ] = [evt.target.name, evt.target.value];
        setFormData(fData => ({
            ...fData,
            [name]: value
        }));
    };

    //handles the login form submission

    async function onSubmit(evt){
        evt.preventDefault();
        try{
            setToken();
            await setUsername(formData.username);
            await setToken(await ToolkitApi.login(formData.username, formData.password));
            ToolkitApi.token = await ToolkitApi.login(formData.username, formData.password);
            setUser(await ToolkitApi.getUser(formData.username))
            setError();
            setFormData({});
        }
        catch(err){
            console.log(err);
            setUser();
            setUsername();
            setError("Invalid username or password")
        }
    }

    return(
        <form onSubmit={onSubmit} style={formVisible}>
            <label htmlFor="username">Username</label>
            <input required type="text" name="username" onChange={handleChange}></input><br/>
            <label htmlFor="password">Password</label>
            <input required type="text" name="password" onChange={handleChange}></input><br/>
            <button>Login</button>
        </form>
    )
}

export default LoginForm;