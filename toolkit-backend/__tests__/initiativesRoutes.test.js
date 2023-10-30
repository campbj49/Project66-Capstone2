const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Initiative = require("../models/initiative");
process.env.NODE_ENV = "test";
let token;
let id;

//modified Auth Test Routes from last project to support initiative tests
describe("Initiative Routes Test", function () {

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
      1,
      [
        {
            "entityId":1,
            "turnOrder":14
        },
        {
            "entityId":3,
            "turnOrder":5
        },
        {
            "entityId":2,
            "turnOrder":1
        }
    ]);
    id = 1;
  });

  /** GET /initiatives => {list of initiatives} */

  describe("GET /initiatives", function(){
    test("can get initiative list", async function(){
      let response = await request(app)
        .get("/initiatives")
        .set({'Authorization':token});
      let initiativeList = response.body.initiatives;
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
      .get(`/initiatives/1`)//${id}`)
      .set({'Authorization':token});
      let initiative = response.body.initiative;
      expect(initiative).toEqual([
            {
                "entityId": 1,
                "encounterId": 1,
                "currentHp": 10,
                "isActive": true,
                "turnOrder": 14,
                "nextEntity":3
            },
            {
                "entityId": 3,
                "encounterId": 1,
                "currentHp":50,
                "isActive": false,
                "turnOrder": expect.any(Number),
                "nextEntity":2
            },
            {
                "entityId": 2,
                "encounterId": 1,
                "isActive": false,
                "turnOrder": expect.any(Number),
                "nextEntity":1
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
      .get(`/initiatives/1/next`)
      .set({'Authorization':token});
      let entity = response.body.entity;
      expect(entity.name).toEqual("testMonster");

      response = await request(app)
      .get(`/initiatives/1/next`)
      .set({'Authorization':token});
      entity = response.body.entity;
      expect(entity.name).toEqual("testPC");

      response = await request(app)
      .get(`/initiatives/1/next`)
      .set({'Authorization':token});
      entity = response.body.entity;
      expect(entity.name).toEqual("testNPC");
    });
  });

  /** POST /initiative => initiative Data */
  describe("POST /initiatives/:encounterId", function () {
    test("can roll new initiative", async function () {
      let response = await request(app)
        .post(`/initiatives/1`)//${id}`)
        .set({'Authorization':token})
        .send({
          "rows":[
              {
                  "entityId":1,
                  "turnOrder":14
              },
              {
                  "entityId":3,
                  "turnOrder":5
              },
              {
                  "entityId":2,
                  "turnOrder":1
              }
          ]
      });

      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
            {
                "entityId": 1,
                "encounterId": 1,
                "currentHp": 10,
                "isActive": true,
                "turnOrder": 14,
                "nextEntity":3
            },
            {
                "entityId": 3,
                "encounterId": 1,
                "currentHp": 50,
                "isActive": false,
                "turnOrder": 5,
                "nextEntity":2
            },
            {
                "entityId": 2,
                "encounterId": 1,
                "isActive": false,
                "turnOrder": 1,
                "nextEntity":1
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
        .put(`/initiatives/1/dmg`)
        .set({'Authorization':token})
        .send({
          "entityId":1,
          "damage":8
        });
      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
        {
            "entityId": 1,
            "encounterId": 1,
            "currentHp": 2,
            "isActive": true,
            "turnOrder": 14,
            "nextEntity": 3
        },
        {
            "entityId": 3,
            "encounterId": 1,
            "currentHp":50,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity":2
        },
        {
            "entityId": 2,
            "encounterId": 1,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity":1
        }
    ]);
    });
    
    test("can kill target entity", async function () {
      let response = await request(app)
        .put(`/initiatives/1/kill`)
        .set({'Authorization':token})
        .send({
          "entityIds":[1]
        });
      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual([
        {
            "entityId": 3,
            "encounterId": 1,
            "currentHp":50,
            "isActive": true,
            "turnOrder": expect.any(Number),
            "nextEntity": 2
        },
        {
            "entityId": 2,
            "encounterId": 1,
            "isActive": false,
            "turnOrder": expect.any(Number),
            "nextEntity":3
        }
    ]);
    });
  });

  /** DELETE /initiatives/:id => {Initiative deleted} */

  describe("DELETE /initiatives/:id", function(){
    test("can delete initiative", async function(){
      let response = await request(app)
        .delete(`/initiatives/1`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("Initiative Cleared");
    });
  });
});

afterAll(async function () {
  await db.end();
});
