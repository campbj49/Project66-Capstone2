import { useState } from "react";
import ToolkitApi from "./api";
/**
 * SignupForm: Creates and handles the form for collecting the information needed to register a user
 * 
 * Props: 
 * -onSubmit: function for passing the form data up to the parent
 * -formData: state for passing form data to parent
 * 
 * States:
 * -message: current value typed into the form
 * 
 * App --> ItemList --> SignupForm
 */

function SignupForm({setToken,setError, setUsername, setUser, formVisible}){
    const [formData, setFormData] = useState({});
    //keeps input val props up to date
    const handleChange = evt => {
        const [ name, value ] = [evt.target.name, evt.target.value];
        setFormData(fData => ({
            ...fData,
            [name]: value
        }));
    };

    //function for manaing the submission of the registration form
    async function onSubmit(evt){
      evt.preventDefault();
      try{
        setToken();
        await setUsername(formData.username);
        await setToken(await ToolkitApi.signup(formData));
        ToolkitApi.token = await ToolkitApi.login(formData.username, formData.password);
        setUser(await ToolkitApi.getUser(formData.username))
        setError();
      }
      catch(err){
        console.log(err);
        setError("Invalid username or password")
      }
      
      setFormData({});
      //browserHistory.push(`/`);
    }

    return(
        <form onSubmit={onSubmit} style={formVisible}>
            <label htmlFor="first_name">First name</label>
            <input required type="text" name="first_name" onChange={handleChange}></input><br/>
            <label htmlFor="last_name">Last name</label>
            <input required type="text" name="last_name" onChange={handleChange}></input><br/>
            <label htmlFor="email">Email</label>
            <input required type="text" name="email" onChange={handleChange}></input><br/>
            <label htmlFor="username">Username</label>
            <input required type="text" name="username" onChange={handleChange}></input><br/>
            <label htmlFor="password">Password</label>
            <input required type="text" name="password" onChange={handleChange}></input><br/>
            <button>Signup</button>
        </form>
    )
}

export default SignupForm;