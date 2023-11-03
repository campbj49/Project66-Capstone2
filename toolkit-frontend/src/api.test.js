const ToolkitApi = require("./api");
const request = require("supertest");

describe("Test API functions", ()=>{
    describe("Authorization functions",()=>{
        test("Gets a token when send correct username and password", async ()=>{
            let token = await ToolkitApi.login("testuser", "password");
            expect(token).toEqual(`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
            eyJ1c2VybmFtZSI6ImNhbXBiajQ5IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY5OTA0Mjk3OX0.
            kKt-sOUaL04o6VxMYGQ65kFhxrlcLSg36vm4g6T7X_k`)
        });
    })
});
