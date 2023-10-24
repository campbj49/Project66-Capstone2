const request = require("supertest");

const app = require("../app");
const db = require("../db");
const RandomEncounterTable = require("../models/randomEncounterTable");
process.env.NODE_ENV = "test";
let token;
let id;
const exampleEncounter ={
    "data":{
      "description":"The high seas",
      "diceCount":1,
      "diceSize":12,
      "trigger":19,
    },
    "encounters":[
      {
        "encounterId":1,
        "rangeStart":2,
        "rangeEnd":3
      },
      {
        "encounterId":2,
        "rangeStart":4,
        "rangeEnd":5
      }
    ]
  };

//modified Auth Test Routes from last project to support randomEncounterTable tests
describe("RandomEncounterTable Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM random_encounter_tables");
    token = await request(app).post("/auth/token")
      .send({
        "username":"testuser",
        "password":"password"
    });

    token = token.body.token;
    
    let I1 = await RandomEncounterTable.create(
      exampleEncounter.data,
      exampleEncounter.encounters,
      "testuser");
    id = I1.id;
  });

  /** GET /randomEncounterTables => {list of randomEncounterTables} */

  describe("GET /randomEncounterTables", function(){
    test("can get randomEncounterTable list", async function(){
      let response = await request(app)
        .get("/ret")
        .set({'Authorization':token});
      let randomEncounterTableList = response.body.randomEncounterTables;
      expect(randomEncounterTableList.length).toEqual(1);
      expect(randomEncounterTableList[0].description).toEqual("The high seas");
    });
  });

  /** GET /randomEncounterTables/:id => {ID's details} */

  describe("GET /randomEncounterTables/:id", function(){
    test("can get randomEncounterTable details", async function(){
      let response = await request(app)
      .get(`/ret/${id}`)
      .set({'Authorization':token});
      let randomEncounterTable = response.body.randomEncounterTable;
      expect(randomEncounterTable.description).toEqual("The high seas");
    });
    test("will return an empty object if the wrong user attempts to access it", async function(){
      
      let falseToken = await request(app).post("/auth/token")
        .send({
          "username":"testadmin",
          "password":"password"
      });

      falseToken = falseToken.body.token;
      let response = await request(app)
      .get(`/ret/${id}`)
      .set({'Authorization':falseToken});
      let randomEncounterTable = response.body.randomEncounterTable;
      expect(randomEncounterTable).toEqual({});
    });
  });

  /** POST /randomEncounterTable => randomEncounterTable Data */

  describe("POST /randomEncounterTables", function () {
    test("can add a new randomEncounterTable", async function () {
      let response = await request(app)
        .post("/ret")
        .set({'Authorization':token})
        .send(exampleEncounter);
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
          id: expect.any(Number),
          description: 'The high seas',
          diceCount:1,
          diceSize:12,
          ownerUsername: 'testuser',
          trigger:19,
          rangeMax: "12",
          encounters:[
            {
                encounterId:1,
                rangeStart:2,
                rangeEnd:3,
                tableId: expect.any(Number)
            },
            {
                encounterId:2,
                rangeStart:4,
                rangeEnd:5,
                tableId: expect.any(Number)
            }
          ]
        }
      );
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/ret")
        .set({'Authorization':token})
        .send({
            "description":"The high seas",
            "trigger":19,
            "encounters":[
              {
                "rangeStart":2,
                "rangeEnd":3
              },
              {
                "encounterId":2,
                "rangeStart":4,
                "rangeEnd":5
              }
            ],
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
            "instance.encounters[0] requires property \"encounterId\"",
            "instance requires property \"data\""
        ],
        "status": 400
    });
    });
  });

  /** PUT randomEncounterTables/:id => {updated randomEncounterTable} */

  describe("PUT /randomEncounterTables/:id", function () {
    test("can update an existing randomEncounterTable", async function () {
      let response = await request(app)
        .put(`/ret/${id}`)
        .set({'Authorization':token})
        .send({
          "data":{
              "description":"The low desert",
              "diceCount":2,
              "diceSize":6,
          }
      });
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
        id: expect.any(Number),
        description: 'The low desert',
        diceCount:2,
        diceSize:6,
        ownerUsername: 'testuser',
        trigger:19,
        rangeMax: "12",
        encounters:[
          {
              encounterId:1,
              rangeStart:2,
              rangeEnd:3,
              tableId: expect.any(Number)
          },
          {
              encounterId:2,
              rangeStart:4,
              rangeEnd:5,
              tableId: expect.any(Number)
          }
        ]
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put(`/ret/${id}`)
        .set({'Authorization':token})
        .send({
          "data":{
              "description":100,
              "diceCount":1,
              "diceSize":12,
          }
      });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
          "instance.data.description is not of a type(s) string",
        ],
        "status": 400
    });
    });
  });

  /** DELETE /randomEncounterTables/:id => {RandomEncounterTable deleted} */

  describe("DELETE /randomEncounterTables/:id", function(){
    test("can delete randomEncounterTable", async function(){
      let response = await request(app)
        .delete(`/ret/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("RandomEncounterTable deleted");
    });
  });
});

afterAll(async function () {
  await db.end();
});
