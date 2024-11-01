const express = require("express");
const path = require("path");
const app = express();
const initializingDB = require("./db_connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let db = null;

const initializingDBAndServer = async () => {

    try {

        db = await initializingDB();

        app.listen(3000, () => {
            console.log("Server is running");
        });

    }

    catch (e) {
        console.log(e.message);
        process.exit(1);
    }

}

initializingDBAndServer();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


//jwt token validation middleware
const validation_middleware = (req, res, next) => {

    let user_jwt_token = req.headers["authorization"];

    if (user_jwt_token !== undefined) {

        jwt.verify(user_jwt_token, "MY_SECRET_TOKEN", async (error, payload) => {
            if (error) {
                res.status(401).send({ message: "Invalid jwt Token" });
            }
            else {
                next();
            }

        });
    }
    else {
        res.status(401).send({ message: "Invalid jwt Token" });
    }

}

//homepage or login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});


//login validation
app.post("/login", async (req, res) => {
    const { user_name, user_password } = req.body;
    const query = `SELECT * FROM login WHERE name LIKE "${user_name}"`;
    const db_user = await db.get(query);

    if (db_user === undefined) {

        res.status(400);
        res.send({ message: "invalid user_name" });
    }
    else {

        let is_valid = await bcrypt.compare(user_password, db_user.password);

        if (is_valid) {
            const payload = { username: user_name, }
            const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
            const token_query = `UPDATE login SET token ="${jwtToken}"`;
            await db.run(token_query);
            res.send({ url: "/todo.html" });

        }
        else {
            res.status(400);
            res.send({ message: "invalid password" });
        }
    }

});

//token path
app.get("/token",async(req,res)=>{
let query=`SELECT * FROM login`;
let login_data=await db.get(query);
    res.send({token:`${login_data.token}`})
});

//all todos path
app.get("/todos", validation_middleware, async (req, res) => {
    const query = `SELECT * FROM todoList`;
    const todos = await db.all(query);
    res.send(todos);
});


//get todo by id 
app.get("/todo/:todoId", validation_middleware, async (req, res) => {
    let {todoId}=req.params;
    const query = `SELECT * FROM todoList WHERE id=${todoId}`;
    const todo = await db.get(query);
    res.send(todo);
});

//add todo path
app.post("/create",validation_middleware,async(req,res)=>{
    let todos =await db.all(`SELECT * FROM todoList`);
    let id=todos.length;
    if (id===0){
        id=1;
    }
    else{
        id+=1;
    }

    let {title,description,due_date,status}=req.body;
    const query=`INSERT INTO todoList(id,title,description,due_date,status) VALUES(${id},"${title}","${description}","${due_date}","${status}")`;
    await db.run(query);
    res.send({message:"created"});

});

//todo update path
app.put("/todo/:todoId", validation_middleware, async(req, res) => {
    const { todoId } = req.params;
    const { title, description, due_date, status } = req.body;
    const query = `UPDATE todoList SET title="${title}",
    description="${description}",
    due_date="${due_date}"
    WHERE
    id=${todoId}`;
    await db.run(query);
    res.send({message:"updated"});
});


//todo status change
app.put("/status/:todoId", validation_middleware, async(req, res) => {
    const { todoId } = req.params;
    const {status} = req.body;
    console.log(req.body)
    const query = `UPDATE todoList SET status="${status}"
    WHERE
    id=${todoId}`;
    await db.run(query);
    res.send({message:"updated"});
});

//todo delete path
app.delete("/todo/:todoId", validation_middleware, async(req, res) => {
    const { todoId } = req.params;
    const query = `DELETE FROM todoList WHERE id=${todoId}`;
    await db.run(query);
    res.send({message:"deleted"});
});

//todos by status path
app.get("/todos/:status", validation_middleware, async (req, res) => {
    let {status}=req.params;
    const query = `SELECT * FROM todoList WHERE status="${status}"`;
    const todos = await db.all(query);
    res.send(todos);
});

//todo by title
app.get("/title/:title", validation_middleware, async (req, res) => {
    let {title}=req.params;
    const query = `SELECT * FROM todoList WHERE title LIKE "%${title}%"`;
    const todos = await db.all(query);
    res.send(todos);
});