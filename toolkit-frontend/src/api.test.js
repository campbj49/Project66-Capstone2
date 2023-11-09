const ToolkitApi = require("./api");//const request = require("supertest");
let token;

describe("Test API functions", ()=>{
    beforeAll(async ()=>{
        //set the token for getting access to all the backend routes
        token = await ToolkitApi.login("testuser", "password");
    })

    //Checks the authorization functions
    describe("Authorization functions",()=>{
        test("Gets a token when send correct username and password", async ()=>{
            expect(token).toEqual(expect.any(String))
        });
    })

    //Checks that primary routes work with the Encounter <item> type
    describe("Encounter core tests",()=>{
        test("GET: user's list", async ()=>{
            let encounters = await ToolkitApi.getList("encounters");
            console.log(encounters);
            expect(encounters.length).toEqual(2)
        })
    });
});
