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
            let encounters = await ToolkitApi.getItemList("encounters");
            //expect(encounters.length).toEqual(2)
            expect(encounters[0].description).toEqual("Example encounter");
        });

        test("POST: create an encounter attatched to the user", async ()=>{
            let newEncounter = await ToolkitApi.createItem("encounters",{
                    "description":"Orcs in a forest",
                    "statBlockId":1,
                    "diceCount":1,
                    "diceSize":6
            });

            expect(newEncounter).toEqual({
                "id": expect.any(Number),
                "description": "Orcs in a forest",
                "ownerUsername": "testuser",
                "isPublic": false,
                "statBlockId": 1,
                "diceSize": 6,
                "diceCount": 1,
                "diceModifier": 0
            });
        })

        test("PUT: Updates target encounter",async ()=>{
            //retreive encounter list to get the id of the test encounter to be deleted
            let encounters = await ToolkitApi.getItemList("encounters");
            expect(encounters.length).toBeGreaterThan(2);
            let id=encounters[encounters.length-1].id;

            let newEncounter = await ToolkitApi.editItem("encounters", id,{
                "description":"Updated encounter",
                "diceCount":2,
                "diceSize":12,
                "diceModifier":6
            })

            expect(newEncounter).toEqual({
                "id": expect.any(Number),
                "description": "Updated encounter",
                "ownerUsername": "testuser",
                "isPublic": false,
                "statBlockId": 1,
                "diceSize": 12,
                "diceCount": 2,
                "diceModifier": 6
            });
        })

        test("DELETE: Removes target encounter",async ()=>{
            //retreive encounter list to get the id of the test encounter to be deleted
            let encounters = await ToolkitApi.getItemList("encounters");
            expect(encounters.length).toBeGreaterThan(2);
            let id=encounters[encounters.length-1].id;

            let delMessage = await ToolkitApi.deleteItem("encounters", id)
            expect(delMessage).toEqual("encounter deleted");

            let newEncounters = await ToolkitApi.getItemList("encounters");
            expect(newEncounters.length).toBe(encounters.length-1);
        })
    });

    //Checks that primary routes work with the Creature <item> type
    describe("Creature core tests",()=>{
        test("GET: user's list of creatures", async ()=>{
            let creatures = await ToolkitApi.getItemList("creatures");
            expect(creatures.length).toEqual(2)
            expect(creatures[0].description).toEqual("exampe NPC inserted at DB creation");
        });
    });

    //Checks that primary routes work with the RET <item> type
    describe("RET core tests",()=>{
        test("GET: user's list of RETs", async ()=>{
            let RETs = await ToolkitApi.getItemList("rets");
            expect(RETs.length).toEqual(1)
            expect(RETs[0].description).toEqual("Example table");
        });
    });
});
