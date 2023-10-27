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
            "initMod":5
        },
        {
            "entityId":2,
            "initMod":1
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
      expect(initiativeList.length).toEqual(2);
      expect(initiativeList[0]).toEqual({
            id: expect.any(Number),
            description:"Example encounter",
            creatureCount:"2"
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
                "isActive": false,
                "turnOrder": 14
            },
            {
                "entityId": 3,
                "encounterId": 1,
                "currentHp":50,
                "isActive": false,
                "turnOrder": expect.any(Number)
            },
            {
                "entityId": 2,
                "encounterId": 1,
                "isActive": false,
                "turnOrder": expect.any(Number)
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
      .get(`/ies/${id}`)
      .set({'Authorization':falseToken});
      let initiative = response.body.initiative;
      expect(initiative).toEqual({});
    });
  });

  /** POST /initiative => initiative Data */

  describe("POST /initiatives", function () {
    test("can add a new initiative", async function () {
      let response = await request(app)
        .post("/ies")
        .set({'Authorization':token})
        .send({
          "name":"Xander",
          "description":"Knight in Shining Armor",
          "type":"PC",
          "playerName":"ジョン",
          "passiveWis":9,
          "ac":25
        });

      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual({
          id: expect.any(Number),
          name: 'Xander',
          description: 'Knight in Shining Armor',
          type:"PC",
          ownerUsername: 'testuser',
          playerName: 'ジョン',
          ac: 25,
          passiveWis: 9
        }
      );
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/ies")
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
            "instance requires property \"name\""
        ],
        "status": 400
    });
    });
  });

  /** PUT initiatives/:id => {updated initiative} */

  describe("PUT /initiatives/:id", function () {
    test("can update an existing initiative", async function () {
      let response = await request(app)
        .put(`/ies/${id}`)
        .set({'Authorization':token})
        .send({
          "name":"Xoomer"
        });
      let newInitiative = response.body.initiative;
      expect(newInitiative).toEqual({
        id: expect.any(Number),
        name: 'Xoomer',
        description: 'Knight in Shining Armor',
        type: "PC",
        ownerUsername: 'testuser',
        playerName: 'ジョン',
        ac: 25,
        passiveWis: 9
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put(`/ies/${id}`)
        .set({'Authorization':token})
        .send({
          "description":100,
          "playerName":"ジョン",
          "passiveWis":9,
          "ac":25
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
          "instance.description is not of a type(s) string",
        ],
        "status": 400
    });
    });
  });

  /** DELETE /initiatives/:id => {Initiative deleted} */

  describe("DELETE /initiatives/:id", function(){
    test("can delete initiative", async function(){
      let response = await request(app)
        .delete(`/ies/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("Initiative deleted");
    });
  });
});

afterAll(async function () {
  await db.end();
});
