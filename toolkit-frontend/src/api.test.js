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

        test("POST: create an creature attatched to the user", async ()=>{
            let newCreature = await ToolkitApi.createItem("creatures",{
                "name":"Xander",
                "description":"Knight in Shining Armor",
                "type":"PC",
                "playerName":"ジョン",
                "passiveWis":9,
                "ac":25
            });

            expect(newCreature).toEqual({
                "id": expect.any(Number),
                "name": "Xander",
                "description": "Knight in Shining Armor",
                "type": "PC",
                "ownerUsername": "testuser",
                "isPublic": false,
                "playerName": "ジョン",
                "ac": 25,
                "passiveWis": 9
            });
        })

        test("PUT: Updates target creature",async ()=>{
            //retreive creature list to get the id of the test creature to be deleted
            let creatures = await ToolkitApi.getItemList("creatures");
            expect(creatures.length).toBeGreaterThan(2);
            let id=creatures[creatures.length-1].id;

            let newCreature = await ToolkitApi.editItem("creatures", id,{
                "description":"Rabbit in Shining Armor",
                "passiveWis":15,
                "ac":18
            })

            expect(newCreature).toEqual({
                "id": expect.any(Number),
                "name": "Xander",
                "description": "Rabbit in Shining Armor",
                "type": "PC",
                "ownerUsername": "testuser",
                "isPublic": false,
                "playerName": "ジョン",
                "ac": 18,
                "passiveWis": 15
            });
        })

        test("DELETE: Removes target creature",async ()=>{
            //retreive creature list to get the id of the test creature to be deleted
            let creatures = await ToolkitApi.getItemList("creatures");
            expect(creatures.length).toBeGreaterThan(2);
            let id=creatures[creatures.length-1].id;

            let delMessage = await ToolkitApi.deleteItem("creatures", id)
            expect(delMessage).toEqual("InitiativeEntity deleted");

            let newCreatures = await ToolkitApi.getItemList("creatures");
            expect(newCreatures.length).toBe(creatures.length-1);
        })
    });

    //Checks that primary routes work with the RET <item> type
    describe("RET core tests",()=>{
        test("GET: user's list of RETs", async ()=>{
            let RETs = await ToolkitApi.getItemList("rets");
            expect(RETs.length).toEqual(2)
            expect(RETs[0].description).toEqual("Example table");
        });

        test("POST: create an RET attatched to the user", async ()=>{
            let newRET = await ToolkitApi.createItem("rets",{
                "data":{
                  "description":"The high seas",
                  "diceCount":2,
                  "diceSize":12,
                  "trigger":19
                },
                "encounters":[
                  {
                    "encounterId":2,
                    "rangeStart":6,
                    "rangeEnd":24
                  },
                  {
                    "encounterId":1,
                    "rangeStart":2,
                    "rangeEnd":5
                  }
                ]
            });

            expect(newRET).toEqual({
                "id": expect.any(Number),
                "description": "The high seas",
                "ownerUsername": "testuser",
                "isPublic": false,
                "diceSize": 12,
                "diceCount": 2,
                "rangeMax": "24",
                "trigger": 19,
                "encounters": [
                    {
                        "tableId": expect.any(Number),
                        "encounterId": 1,
                        "rangeStart": 2,
                        "rangeEnd": 5
                    },
                    {
                        "tableId": expect.any(Number),
                        "encounterId": 2,
                        "rangeStart": 6,
                        "rangeEnd": 24
                    }
                ]
            });
        })

        test("PUT: Updates target RET",async ()=>{
            //retreive RET list to get the id of the test RET to be deleted
            let RETs = await ToolkitApi.getItemList("rets");
            expect(RETs.length).toBeGreaterThan(2);
            let id=RETs[RETs.length-1].id;

            let newRET = await ToolkitApi.editItem("rets", id,{
                "data":{
                  "description":"The seas that aren't high"
                }
            })

            expect(newRET).toEqual({
                "id": expect.any(Number),
                "description": "The seas that aren't high",
                "ownerUsername": "testuser",
                "isPublic": false,
                "diceSize": 12,
                "diceCount": 2,
                "rangeMax": "24",
                "trigger": 19,
                "encounters": [
                    {
                        "tableId": expect.any(Number),
                        "encounterId": 1,
                        "rangeStart": 2,
                        "rangeEnd": 5
                    },
                    {
                        "tableId": expect.any(Number),
                        "encounterId": 2,
                        "rangeStart": 6,
                        "rangeEnd": 24
                    }
                ]
            });
        })

        test("DELETE: Removes target RET",async ()=>{
            //retreive RET list to get the id of the test RET to be deleted
            let RETs = await ToolkitApi.getItemList("rets");
            expect(RETs.length).toBeGreaterThan(2);
            let id=RETs[RETs.length-1].id;

            let delMessage = await ToolkitApi.deleteItem("rets", id)
            expect(delMessage).toEqual("RandomEncounterTable deleted");

            let newRETs = await ToolkitApi.getItemList("rets");
            expect(newRETs.length).toBe(RETs.length-1);
        })
    });
});
