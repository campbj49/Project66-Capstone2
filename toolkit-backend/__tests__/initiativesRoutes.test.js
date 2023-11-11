const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Initiative = require("../models/initiative");
const InitiativeEntity = require("../models/initiativeEntity");
const Encounter = require("../models/encounter");
process.env.NODE_ENV = "test";
let token;
let id;
let statBlockId={};
let encounterId;

//modified Auth Test Routes from last project to support initiative tests
describe("Initiative Routes Test", function () {

  //create a set of example creatures and encounters to be used in the each of the tests
  beforeAll(async ()=>{
    await db.query("DELETE FROM initiative");
    await db.query("DELETE FROM initiative_entities");
    token = await request(app).post("/auth/token")
      .send({
        "username":"testuser",
        "password":"password"
    });

    token = token.body.token;
    
    let exPC = await InitiativeEntity.create({
      "name":"testPC",
      "description":"Knight in Shining Armor",
      "type": "PC",
      "playerName":"ジョン",
      "passiveWis":9,
      "ac":25
    }, "testuser");
    statBlockId.pc = exPC.id;

    let exNPC = await InitiativeEntity.create({
        "name":"testNPC",
        "description":"King of the realm",
        "type": "NPC",
        "hpMax":10
      }, "testuser");
    statBlockId.npc = exNPC.id;

    let exMonster = await InitiativeEntity.create({
      "name":"testMonster",
      "description":"Furry undomesticated dog",
      "type": "Monster",
      "hpMax":8
    }, "testuser");
    statBlockId.monster = exMonster.id;

    let exEncounter = await Encounter.create({
      "description":"Example encounter",
      "statBlockId":statBlockId.monster,
      "diceCount":1,
      "diceSize":12,
    }, "testuser");
    encounterId = exEncounter.id;
  });

  //prepare a fresh initiative for each test
  beforeEach(async function () {
    await db.query("DELETE FROM initiative");
    token = await request(app).post("/auth/token")
      .send({
        "username":"testuser",
        "password":"password"
    });

    token = token.body.token;
    
    await Initiative.rollInitiative(
      "testuser",
      encounterId,
      [
        {
            "entityId": statBlockId.pc,
            "turnOrder":14
        },
        {
            "entityId": statBlockId.monster,
            "turnOrder":5
        },
        {
            "entityId": statBlockId.npc,
            "turnOrder":1
        }
    ]);
    id = encounterId;
  });

  /** GET /initiatives => {list of initiatives} */

  describe("GET /initiatives", function(){
    test("can get initiative list", async function(){
      let response = await request(app)
        .get("/initiatives")
        .set({'Authorization':token});
      let initiativeList = response.body.initiativeList;
      expect(initiativeList.length).toEqual(1);
      expect(initiativeList[0]).toEqual({
            id: expect.any(Number),
            description:"Example encounter",
            creatureCount:"3"
      });
    });
  });

  /** GET /initiatives/:id => {ID's details} */

  describe("GET /initiatives/:id", function(){
    test("can get initiative details", async function(){
      let response = await request(app)
      .get(`/initiatives/${id}`)
      .set({'Authorization':token});
      let initiative = response.body.initiative;
      expect(initiative).toEqual([
            {
                "entityId": statBlockId.pc,
                "encounterId": encounterId,
                "isActive": true,
                "turnOrder": 14,
                "nextEntity": statBlockId.monster
            },
            {
                "entityId": statBlockId.monster,
                "encounterId": encounterId,
                "currentHp":8,
                "isActive": false,
                "turnOrder": expect.any(Number),
                "nextEntity": statBlockId.npc
            },
            {
                "entityId": statBlockId.npc,
                "encounterId": encounterId,
                "currentHp": 10,
                "isActive": false,
                "turnOrder": expect.any(Number),
                "nextEntity": statBlockId.pc
            }
        ]);
    });
    test("will return an empty object if the wrong user attempts to access it", async function(){
      
      let falseToken = await request(app).post("/auth/token")
        .send({
          "username":"testadmin",
          "password":"password"
      });

      falseToken = falseToken.body.token;
      let response = await request(app)
      .get(`/initiatives/1`)
      .set({'Authorization':falseToken});

      let error = response.body.error;
      expect(error).toEqual({
        "message":"No initiative ID associated with that username.",
        "status": 400
    });
    });
  });

  /** GET /initiatives/:id/next => nextEntityCard */

  describe("GET /initiatives/:id/next", function(){
    test("can get next creature cards details in a loop", async function(){
      let response = await request(app)
      .get(`/initiatives/${id}/next`)
      .set({'Authorization':token});
      let entity = response.body.entity;
      expect(entity.name).toEqual("testMonster");

      response = await request(app)
      .get(`/initiatives/${id}/next`)
      .set({'Authorization':token});
      entity = response.body.entity;
      expect(entity.name).toEqual("testNPC");

      response = await request(app)
      .get(`/initiatives/${id}/next`)
      .set({'Authorization':token});
      entity = response.body.entity;
      expect(entity.name).toEqual("testPC");
    });
  });

  /** POST /initiative => initiative Data */
  describe("POST /initiatives/:encounterId", function () {
    test("can roll new initiative", async function () {
      let response = await request(app)
        .post(`/initiatives/${id}`)
        .set({'Authorization':token})
        .send({
          "rows":[
              {
                  "entityId": statBlockId.pc,
                  "turnOrder":14
              },
              {
                  "entityId": statBlockId.monster,
                  "turnOrder":5
              },
              {
                  "entityId": statBlockId.npc,
                  "turnOrder":1
              }
          ]
      });

      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
            {
                "entityId": statBlockId.pc,
                "encounterId": encounterId,
                "isActive": true,
                "turnOrder": 14,
                "nextEntity": statBlockId.monster
            },
            {
                "entityId": statBlockId.monster,
                "encounterId": encounterId,
                "currentHp":8,
                "isActive": false,
                "turnOrder": 5,
                "nextEntity": statBlockId.npc
            },
            {
                "entityId": statBlockId.npc,
                "encounterId": encounterId,
                "currentHp": 10,
                "isActive": false,
                "turnOrder": 1,
                "nextEntity": statBlockId.pc
            }
        ]);
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/initiatives/1")
        .set({'Authorization':token})
        .send({
          "description":"Knight in Shining Armor",
          "playerName":"ジョン",
          "passiveWis":9,
          "ac":25
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
            "instance requires property \"rows\""
        ],
        "status": 400
    });
    });
  });

  /** PUT initiatives/:id => {updated initiative} */

  describe("PUT /initiatives/:id", function () {
    test("can damage target entity", async function () {
      let response = await request(app)
        .put(`/initiatives/${id}/dmg`)
        .set({'Authorization':token})
        .send({
          "entityId": statBlockId.npc,
          "damage":8
        });
      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
        {
            "entityId": statBlockId.pc,
            "encounterId": encounterId,
            "isActive": true,
            "turnOrder": 14,
            "nextEntity": statBlockId.monster
        },
        {
            "entityId": statBlockId.monster,
            "encounterId": encounterId,
            "currentHp":8,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity": statBlockId.npc
        },
        {
            "entityId": statBlockId.npc,
            "encounterId": encounterId,
            "currentHp": 2,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity": statBlockId.pc
        }
    ]);
    });
    
    test("can kill target entity", async function () {
      let response = await request(app)
        .put(`/initiatives/${id}/kill`)
        .set({'Authorization':token})
        .send({
          "entityIds":[statBlockId.pc]
        });
      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
        {
            "entityId": statBlockId.monster,
            "encounterId": encounterId,
            "currentHp":8,
            "isActive": true,
            "turnOrder": expect.any(Number),
            "nextEntity": statBlockId.npc
        },
        {
            "entityId": statBlockId.npc,
            "encounterId": encounterId,
            "currentHp":10,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity": statBlockId.monster
        }
    ]);
    });
  });

  /** DELETE /initiatives/:id => {Initiative deleted} */

  describe("DELETE /initiatives/:id", function(){
    test("can delete initiative", async function(){
      let response = await request(app)
        .delete(`/initiatives/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("Initiative Cleared");
    });
  });
});

afterAll(async function () {
  await db.end();
});
