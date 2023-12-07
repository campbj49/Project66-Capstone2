import axios from "axios";
//const axios = require("axios");

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
    const headers = { Authorization: `${ToolkitApi.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      const response = await axios({ url, method, data, params, headers });
      console.log(response);
      return response.data;//(await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response || err.message);

      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes
  
  /**TODO: Get list of user's <item> */
  static async getItemList(type){
    let res = await this.request(itemConverter[type].url);
    return res[itemConverter[type].response+"List"];
  }

  /**TODO: Get public list of <item> */

  /**TODO: Send create <item> command*/
  static async createItem(type, data){
    let res = await this.request(itemConverter[type].url, data, "post");
    return res[itemConverter[type].response];
  }

  /**TODO: Send edit <item> command*/
  static async editItem(type, id, data){
    let res = await this.request(`${itemConverter[type].url}/${id}`, data, "put");
    return res[itemConverter[type].response];
  }

  /**TODO: Send delete <item> command */
  static async deleteItem(type, id){
    let res = await this.request(`${itemConverter[type].url}/${id}`,{},"delete");
    return res.message;
  }

  /**TODO: Get user's quick initiative */

  //manage authorization

  static async login(username, password){
    let res = await this.request("auth/token",{username:username, password:password}, "post" );
    this.token = res.token;
    return res.token;
  }

  static async signup(formData){
    let res = await this.request("auth/register",
                                  {
                                    username: formData.username,
                                    password: formData.password,
                                    firstName: formData.firstName,
                                    lastName: formData.lastName,
                                    email: formData.email
                                  },"post");  
    this.token = res.token;
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
    return res.user;
  }

  //deletes a user from the backend
  static async deleteUser(username){
    let res = await this.request(`users/${username}`, {}, "delete");
    return res.deleted;
  }
}

//converter for translating frontend urls to backend urls
const itemConverter = {
  encounters:{
    url:"encounters",
    response:"encounter"
  },
  creatures:{
    url:"ies",
    response:"initiativeEntity"
  },
  rets:{
    url:"rets",
    response:"randomEncounterTable"
  }
}

//module.exports = ToolkitApi;

//have to comment this out to keep jest from throwing a fit
export default ToolkitApi;
