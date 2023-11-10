const { BadRequestError } = require("../expressError");
//code taken and modified from the provided model of the react-jobly project

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql = defaultJsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //Create a generic insert statement by splitting the column names and indexes
  let createVals = {cols:[], idx:[]}
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>{
      createVals.cols.push(jsToSql[colName] || colName);
      createVals.idx.push(`$${idx + 1}`);
      return `"${jsToSql[colName] || colName}"=$${idx + 1}`;
    },
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
    createdVals: createVals
  };
}

/**
 * Helper function for parsing SQL responses
 * 
 * @param {Object} sqlRes default SQL response object
 * @param {Object} jsToSql maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 * @returns {Object} SQL response object with null columns removed and column names converted
 * to js-style data fields
 */
function sqlResToJs(sqlRes, jsToSql = defaultJsToSql){
  //swap the values and keys of the jsToSql object
  let sqlToJs = {};
  for(let key in jsToSql)
    sqlToJs[jsToSql[key]] = key;

  //put response into a new object
  let res = {}
  for(let key in sqlRes)
    if(sqlRes[key] != undefined) res[sqlToJs[key]||key] = sqlRes[key]
  
  return res;
}

//version of sqlResToJs that works on an array instead of a single row
function sqlArrToJs(sqlArr){
  let jsRes = [];
  for(let row of sqlArr)
    jsRes.push(sqlResToJs(row));
  return jsRes;
}

//jsToSql for the initiativeEntity class, to be used as the default value
//as it will be the primary class using this function
const defaultJsToSql = {
  ownerUsername:"owner_username",
  createdBy:"created_by",
  isPublic:"is_public",
  playerName:"player_name",
  passiveWis:"passive_wis",
  statBlockId:"stat_block_id",
  tableId:"table_id",
  encounterId:"encounter_id",
  rangeStart:"range_start",
  rangeEnd:"range_end",
  diceSize:"dice_size",
  diceCount:"dice_count",
  rangeMax:"range_max",
  creatureCount:"creature_count",
  entityId:"entity_id",
  encounterId:"encounter_id",
  currentHp:"current_hp",
  isActive:"is_active",
  turnOrder:"turn_order",
  hpMax:"hp_max",
  nextEntity:"next_entity",
  diceModifier:"dice_modifier"
  //to be extended as more details are added to the stat block
}

module.exports = { sqlForPartialUpdate, sqlResToJs, sqlArrToJs };
