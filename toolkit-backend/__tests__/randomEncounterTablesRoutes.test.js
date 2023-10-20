const request = require("supertest");

const app = require("../app");
const db = require("../db");
const RandomEncounterTable = require("../models/randomEncounterTable");
process.env.NODE_ENV = "test";
let token;
let id;
const exampleEncounter ={
    "description":"The high seas",
    "dice":"1d8+1d12",
    "trigger":19,
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
    
    let I1 = await RandomEncounterTable.create({
        "description":"The high seas",
        "dice":"1d8+1d12",
        "trigger":19,
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
      }, "testuser");
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
        .send({
            "description":"The high seas",
            "dice":"1d8+1d12",
            "trigger":19,
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
          });
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
          id: expect.any(Number),
          description: 'The high seas',
          dice:"1d8+1d12",
          ownerUsername: 'testuser',
          trigger:19,
          encounters:[
            {
                encounterId:1,
                rangeStart:2,
                rangeEnd:3
            },
            {
                encounterId:2,
                rangeStart:4,
                rangeEnd:5
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
            "instance.encounters[0] requires property \"id\"",
            "instance requires property \"dice\""
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
            "description":"The low desert",
            "dice":"1d12",
        });
      let newRandomEncounterTable = response.body.randomEncounterTable;
      expect(newRandomEncounterTable).toEqual({
        id: expect.any(Number),
        description: 'The low desert',
        dice:"1d12",
        ownerUsername: 'testuser',
        trigger:19,
        encounters:[
          {
              encounterId:1,
              rangeStart:2,
              rangeEnd:3
          },
          {
              encounterId:2,
              rangeStart:4,
              rangeEnd:5
          }
        ]
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put(`/ret/${id}`)
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
            "instance.encounters[0] requires property \"id\"",
            "instance requires property \"dice\""
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
