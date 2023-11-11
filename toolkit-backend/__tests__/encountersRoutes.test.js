const request = require("supertest");

const app = require("../app");
const db = require("../db");
const encounter = require("../models/encounter");
const InitiativeEntity = require("../models/initiativeEntity");
process.env.NODE_ENV = "test";
let token;
let id;
let statBlockId;

//modified Auth Test Routes from last project to support encounter tests
describe("encounter Routes Test", function () {

  //create an example creature to be used in the each of the tests
  beforeAll(async ()=>{
    await db.query("DELETE FROM initiative_entities");
    token = await request(app).post("/auth/token")
      .send({
        "username":"testuser",
        "password":"password"
    });

    token = token.body.token;
    
    let I1 = await InitiativeEntity.create({
      "name":"Xander",
      "description":"Knight in Shining Armor",
      "type": "PC",
      "playerName":"ジョン",
      "passiveWis":9,
      "ac":25
    }, "testuser");
    statBlockId = I1.id;
  });


  //clear the database each time
  beforeEach(async function () {
    await db.query("DELETE FROM encounters");
    token = await request(app).post("/auth/token")
      .send({
        "username":"testuser",
        "password":"password"
    });

    token = token.body.token;
    
    let I1 = await encounter.create({
      "description":"Orcs in a forest",
      "statBlockId":statBlockId,
      "diceCount":1,
      "diceSize":12,
    }, "testuser");
    id = I1.id;
  });

  /** GET /encounters => {list of encounters} */

  describe("GET /encounters", function(){
    test("can get encounter list", async function(){
      let response = await request(app)
        .get("/encounters")
        .set({'Authorization':token});
      let encounterList = response.body.encounterList;
      expect(encounterList.length).toEqual(1);
      expect(encounterList[0].description).toEqual("Orcs in a forest");
    });
  });

  /** GET /encounters/:id => {ID's details} */

  describe("GET /encounters/:id", function(){
    test("can get encounter details", async function(){
      let response = await request(app)
      .get(`/encounters/${id}`)
      .set({'Authorization':token});
      let encounter = response.body.encounter;
      expect(encounter.description).toEqual("Orcs in a forest");
    });
    test("will return an empty object if the wrong user attempts to access it", async function(){
      
      let falseToken = await request(app).post("/auth/token")
        .send({
          "username":"testadmin",
          "password":"password"
      });

      falseToken = falseToken.body.token;
      let response = await request(app)
      .get(`/encounters/${id}`)
      .set({'Authorization':falseToken});
      let encounter = response.body.encounter;
      expect(encounter).toEqual({});
    });
  });

  /** POST /encounter => encounter Data */

  describe("POST /encounters", function () {
    test("can add a new encounter", async function () {
      let response = await request(app)
        .post("/encounters")
        .set({'Authorization':token})
        .send({
            "description":"Orcs in a forest",
            "statBlockId":statBlockId,
            "diceCount":1,
            "diceSize":12,
        });

      let newencounter = response.body.encounter;
      expect(newencounter).toEqual({
          id: expect.any(Number),
          description: 'Orcs in a forest',
          ownerUsername:"testuser",
          statBlockId:statBlockId,
          diceCount:1,
          diceSize:12,
          diceModifier:0,
          isPublic:false
        }
      );
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/encounters")
        .set({'Authorization':token})
        .send({
            "description":"Orcs in a forest",
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
            "instance requires property \"statBlockId\"",
            "instance requires property \"diceCount\"",
            "instance requires property \"diceSize\"",
      
        ],
        "status": 400
    });
    });
  });

  /** PUT encounters/:id => {updated encounter} */

  describe("PUT /encounters/:id", function () {
    test("can update an existing encounter", async function () {
      let response = await request(app)
        .put(`/encounters/${id}`)
        .set({'Authorization':token})
        .send({
            "description":"Orcs in a desert",
            "diceCount":1,
            "diceSize":12,
        });
      let newencounter = response.body.encounter;
      expect(newencounter).toEqual({
        id: expect.any(Number),
        description: 'Orcs in a desert',
        ownerUsername:"testuser",
        statBlockId:statBlockId,
        diceCount:1,
        diceSize:12,
        diceModifier:0,
        isPublic:false
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put(`/encounters/${id}`)
        .set({'Authorization':token})
        .send({
          "description":100
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
          "instance.description is not of a type(s) string",
        ],
        "status": 400
      });
    });

    test("will throw an error if the id doesn't exist for that user", async function () {
      let response = await request(app)
        .put(`/encounters/${id+1}`)
        .set({'Authorization':token})
        .send({
          "description":"Updated encounter"
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message":"Invalid user/encounter id combo",
        "status": 400
      });
    });
  });

  /** DELETE /encounters/:id => {encounter deleted} */

  describe("DELETE /encounters/:id", function(){
    test("can delete encounter", async function(){
      let response = await request(app)
        .delete(`/encounters/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("encounter deleted");
    });

    test("will throw an error if the target doesn't exist", async function(){
      let response = await request(app)
        .delete(`/encounters/${id-1}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("encounter does not exist");
    });
  });
});

afterAll(async function () {
  await db.end();
});
