import { useState } from "react";
import ToolkitApi from "./api";
import { Redirect, useParams } from "react-router-dom/cjs/react-router-dom.min";
/**
 * CreationForm: Creates and handles the form for getting a user into the website itself
 * 
 * Props: 
 * -onSubmit: function for passing the form data up to the parent
 * -formData: state for passing form data to parent
 * 
 * States:
 * -message: current value typed into the form
 * 
 * App --> CreationForm
 */

function CreationForm({user}){
    const [formData, setFormData] = useState({});
    const {type}=useParams();
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
        // try{
        //     let token = await ToolkitApi.login(formData.username, formData.password);
        //     await setUser({
        //         username:formData.username,
        //         token: token
        //     });
        //     ToolkitApi.token = token;
        //     setError();
        //     setFormData({});
        // }
        // catch(err){
        //     console.log(err);
        //     setUser({});
        //     setError("Invalid username or password")
        // }
    }

    return(
        <form onSubmit={onSubmit}>
            <h1>Creation Form Stub for {type}</h1>
            <label htmlFor="username">Username</label>
            <input required type="text" name="username" onChange={handleChange}></input><br/>
            <label htmlFor="password">Password</label>
            <input required type="text" name="password" onChange={handleChange}></input><br/>
            <button>Creation</button>
        </form>
    )
}

export default CreationForm;