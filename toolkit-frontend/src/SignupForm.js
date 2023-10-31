import { useState } from "react";
/**
 * SignupForm: Creates and handles the form for collecting the madLib words
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

function SignupForm({onSubmit, setFormData, formVisible}){
    //keeps input val props up to date
    const handleChange = evt => {
        const [ name, value ] = [evt.target.name, evt.target.value];
        setFormData(fData => ({
            ...fData,
            [name]: value
        }));
    };

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