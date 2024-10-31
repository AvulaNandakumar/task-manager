const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");


const db_path = path.join(__dirname, "todo.db");
let db = null;

const initializingDB=async()=>{
    db = await open({
        filename: db_path,
        driver: sqlite3.Database,
    });
    return db
}

module.exports = initializingDB;