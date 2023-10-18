const request = require("supertest");

const app = require("../app");
const db = require("../db");
const InitiativeEntity = require("../models/initiativeEntity");
process.env.NODE_ENV = "test";
let token;
let id;

//modified Auth Test Routes from last project to support initiativeEntity tests
describe("InitiativeEntity Routes Test", function () {

  beforeEach(async function () {
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
      "playerName":"ジョン",
      "passiveWis":9,
      "ac":25
    }, "testuser");
    id = I1.id;
  });

  /** GET /initiativeEntities => {list of initiativeEntities} */

  describe("GET /initiativeEntities", function(){
    test("can get initiativeEntity list", async function(){
      let response = await request(app)
        .get("/ies")
        .set({'Authorization':token});
      let initiativeEntityList = response.body.initiativeEntities;
      expect(initiativeEntityList.length).toEqual(1);
      expect(initiativeEntityList[0].name).toEqual("Xander");
    });
  });

  /** GET /initiativeEntities/:id => {ID's details} */

  describe("GET /initiativeEntities/:id", function(){
    test("can get initiativeEntity details", async function(){
      let response = await request(app)
      .get(`/ies/${id}`)
      .set({'Authorization':token});
      let initiativeEntity = response.body.initiativeEntity;
      expect(initiativeEntity.name).toEqual("Xander");
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
      let initiativeEntity = response.body.initiativeEntity;
      expect(initiativeEntity).toEqual({});
    });
  });

  /** POST /initiativeEntity => initiativeEntity Data */

  describe("POST /initiativeEntities", function () {
    test("can add a new initiativeEntity", async function () {
      let response = await request(app)
        .post("/ies")
        .set({'Authorization':token})
        .send({
          "name":"Xander",
          "description":"Knight in Shining Armor",
          "playerName":"ジョン",
          "passiveWis":9,
          "ac":25
        });

      let newInitiativeEntity = response.body.initiativeEntity;
      expect(newInitiativeEntity).toEqual({
          id: expect.any(Number),
          name: 'Xander',
          description: 'Knight in Shining Armor',
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

  /** PUT initiativeEntities/:id => {updated initiativeEntity} */

  describe("PUT /initiativeEntities/:id", function () {
    test("can update an existing initiativeEntity", async function () {
      let response = await request(app)
        .put(`/ies/${id}`)
        .set({'Authorization':token})
        .send({
          "name":"Xoomer",
          "description":"Knight in Shining Armor",
          "playerName":"ジョン",
          "passiveWis":9,
          "ac":25
        });
      let newInitiativeEntity = response.body.initiativeEntity;
      expect(newInitiativeEntity).toEqual({
        id: expect.any(Number),
        name: 'Xoomer',
        description: 'Knight in Shining Armor',
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

  /** DELETE /initiativeEntities/:id => {InitiativeEntity deleted} */

  describe("DELETE /initiativeEntities/:id", function(){
    test("can delete initiativeEntity", async function(){
      let response = await request(app)
        .delete(`/ies/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("InitiativeEntity deleted");
    });
  });
});

afterAll(async function () {
  await db.end();
});
