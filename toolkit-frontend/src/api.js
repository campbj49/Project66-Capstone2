import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class ToolkitApi {
  // the token for interacting with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${ToolkitApi.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes
  
  /**TODO: Get list of user's initiative entities */

  /**TODO: Get list of user's encounters */

  /**TODO: Get list of user's random encounter tables */

  /**TODO: Get user's quick initiative */

  //manage authorization

  static async login(username, password){
    console.log("this is being run")
    let res = await this.request("auth/token",{username:username, password:password}, "post" );
    return res.token;
  }

  static async signup(formData){
    let res = await this.request("auth/register",
                                  {
                                    username: formData.username,
                                    password: formData.password,
                                    firstName: formData.first_name,
                                    lastName: formData.last_name,
                                    email: formData.email
                                  },"post");  
    return res.token;
  }

  //retrieves user data
  static async getUser(username){
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  //updates user data

  static async updateUser(username, data){
    let res = await this.request(`users/${username}`, data, "patch");
    console.log(res);
    return res.user;
  }
}

// for now, put token ("testuser" / "password" on class)
ToolkitApi.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
    "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
    "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc";

export default ToolkitApi;
