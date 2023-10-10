/** Common config for bookstore. */


let DB_URI = `postgresql://postgres:@localhost:5432`;
// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/toolkit_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/toolkit`;
}


module.exports = { 
  DB_URI, 
  BCRYPT_WORK_FACTOR,
  SECRET_KEY
};