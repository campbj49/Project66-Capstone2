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
        test("GET: user's list of encounters", async ()=>{
            let encounters = await ToolkitApi.getList("encounters");
            expect(encounters.length).toEqual(2)
            expect(encounters[0].description).toEqual("Example encounter");
        });
    });

    //Checks that primary routes work with the Creature <item> type
    describe("Creature core tests",()=>{
        test("GET: user's list of creatures", async ()=>{
            let creatures = await ToolkitApi.getList("creatures");
            expect(creatures.length).toEqual(2)
            expect(creatures[0].description).toEqual("exampe NPC inserted at DB creation");
        });
    });

    //Checks that primary routes work with the RET <item> type
    describe("RET core tests",()=>{
        test("GET: user's list of RETs", async ()=>{
            let RETs = await ToolkitApi.getList("rets");
            expect(RETs.length).toEqual(1)
            expect(RETs[0].description).toEqual("Example table");
        });
    });
});
