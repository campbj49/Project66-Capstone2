const request = require("supertest");

const app = require("../app");
const db = require("../db");
const RandomEncounterTable = require("../models/randomEncounterTable");
const Encounter = require("../models/encounter");
const InitiativeEntity = require("../models/initiativeEntity");
process.env.NODE_ENV = "test";
let token;
let id;
let exampleEncounter;

//modified Auth Test Routes from last project to support randomEncounterTable tests
describe("RandomEncounterTable Routes Test", function () {
  //create a new encounters to be used in the whole set of the tests
  beforeAll(async ()=>{
    let exMonster = await InitiativeEntity.create({
      "name":"testMonster",
      "description":"Furry undomesticated dog",
      "type": "Monster",
      "hpMax":8
    }, "testuser");

    let exEncounter1 = await Encounter.create({
      "description":"Example encounter 1",
      "statBlockId":exMonster.id,
      "diceCount":1,
      "diceSize":12,
    }, "testuser");
    
    let exEncounter2 = await Encounter.create({
      "description":"Example encounter 2",
      "statBlockId":exMonster.id,
      "diceCount":1,
      "diceSize":12,
    }, "testuser");
    
    exampleEncounter ={
      "data":{
        "description":"The high seas",
        "diceCount":2,
        "diceSize":12,
        "trigger":19
      },
      "encounters":[
        {
          "encounterId":exEncounter1.id,
          "rangeStart":6,
          "rangeEnd":24
        },
        {
          "encounterId":exEncounter2.id,
          "rangeStart":2,
          "rangeEnd":5
        }
      ]
    }
  });

  //create a fresh table before each test
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
        .get("/rets")
        .set({'Authorization':token});
      let randomEncounterTableList = response.body.randomEncounterTableList;
      expect(randomEncounterTableList.length).toEqual(1);
      expect(randomEncounterTableList[0].description).toEqual("The high seas");
    });
  });

  /** GET /randomEncounterTables/:id => {ID's details} */

  describe("GET /randomEncounterTables/:id", function(){
    test("can get randomEncounterTable details", async function(){
      let response = await request(app)
      .get(`/rets/${id}`)
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
      .get(`/rets/${id}`)
      .set({'Authorization':falseToken});
      let randomEncounterTable = response.body.randomEncounterTable;
      expect(randomEncounterTable).toEqual({});
    });
  });

  /** POST /randomEncounterTable => randomEncounterTable Data */

  describe("POST /randomEncounterTables", function () {
    test("can add a new randomEncounterTable", async function () {
      let response = await request(app)
        .post("/rets")
        .set({'Authorization':token})
        .send(exampleEncounter);
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
          id: expect.any(Number),
          isPublic: false,
          description: 'The high seas',
          diceCount:2,
          diceSize:12,
          ownerUsername: 'testuser',
          trigger:19,
          rangeMax: "24",
          encounters:[
            {
                encounterId:exampleEncounter.encounters[0].encounterId,
                rangeStart:2,
                rangeEnd:5,
                tableId: expect.any(Number)
            },
            {
                encounterId:exampleEncounter.encounters[1].encounterId,
                rangeStart:6,
                rangeEnd:24,
                tableId: expect.any(Number)
            }
          ]
        }
      );
    });

    test("will not allow invalid dice ranges through", async function(){
      let response = await request(app)
        .post("/rets")
        .set({'Authorization':token})
        .send({
          "data":{
            "description":"The high seas",
            "diceCount":2,
            "diceSize":12,
            "trigger":19
          },
          "encounters":[
            {
              "encounterId":exampleEncounter.encounters[1].encounterId,
              "rangeStart":6,
              "rangeEnd":23
            },
            {
              "encounterId":exampleEncounter.encounters[0].encounterId,
              "rangeStart":2,
              "rangeEnd":5
            }
          ]
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": "Invalid encounter ranges",
        "status": 400
    });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/rets")
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
                "encounterId":exampleEncounter.encounters[1].encounterId,
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
        .put(`/rets/${id}`)
        .set({'Authorization':token})
        .send({
          "data":{
              "description":"The low desert",
              "diceSize":6
          },
          "encounters":[
            {
              "encounterId":exampleEncounter.encounters[0].encounterId,
              "rangeStart":2,
              "rangeEnd":3
            },
            {
              "encounterId":exampleEncounter.encounters[1].encounterId,
              "rangeStart":4,
              "rangeEnd":12
            }
          ]
      });
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
        id: expect.any(Number),
        isPublic: false,
        description: 'The low desert',
        diceCount:2,
        diceSize:6,
        ownerUsername: 'testuser',
        trigger:19,
        rangeMax: "12",
        encounters:[
          {
              encounterId:exampleEncounter.encounters[0].encounterId,
              rangeStart:2,
              rangeEnd:3,
              tableId: expect.any(Number)
          },
          {
              encounterId:exampleEncounter.encounters[1].encounterId,
              rangeStart:4,
              rangeEnd:12,
              tableId: expect.any(Number)
          }
        ]
      });
    });

    test("will not allow invalid dice ranges through", async function(){
        let response = await request(app)
          .put(`/rets/${id}`)
          .set({'Authorization':token})
          .send({
            "data":{
              "description":"The high seas",
              "diceCount":2,
              "diceSize":12,
              "trigger":19
            },
            "encounters":[
              {
                "encounterId":exampleEncounter.encounters[1].encounterId,
                "rangeStart":6,
                "rangeEnd":23
              },
              {
                "encounterId":exampleEncounter.encounters[0].encounterId,
                "rangeStart":2,
                "rangeEnd":5
              }
            ]
          });

        let error = response.body.error;
        expect(error).toEqual({
          "message": "Invalid encounter ranges",
          "status": 400
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put(`/rets/${id}`)
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
        .delete(`/rets/${id}`)
        .set({'Authorization':token});
      let message = response.body.message;
      expect(message).toEqual("RandomEncounterTable deleted");
    });
  });
});

afterAll(async function () {
  await db.end();
});
