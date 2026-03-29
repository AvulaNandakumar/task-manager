const express = require("express");
const path = require("path");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(cookieParser());
let db = null;

const jwt = require("jsonwebtoken");
const { stat } = require("fs");

const initializingDBAndServer = async () => {

    try {

        db = await open({
            filename: path.join(__dirname, "./todo.db"),
            driver: sqlite3.Database
        });


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

    let user_jwt_token = req.cookies["jwt_token"];

    if (user_jwt_token !== undefined) {

        jwt.verify(user_jwt_token, "MY_SECRET_TOKEN", async (error, payload) => {
            if (error) {
                res.status(401).send({ message: "Invalid jwt Token" });
            }
            else {
                req.user_name = payload["username"];
                req.id = payload["id"];
                req.role=payload["role"];
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

//register
app.post("/register", async (req, res) => {
    const { name, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let query_1 = `INSERT INTO users(name,password,role) VALUES(?,?,?)`;
    db.run(query_1, [name, hashedPassword, role]);
    res.status(201).send("created")
}
)



//login validation
app.post("/login", async (req, res) => {
    const { user_name, user_password } = req.body;
    const query = `SELECT * FROM users WHERE name LIKE ?`;
    let db_user = await db.get(query, [user_name]);

    if (db_user === undefined) {


        res.status(400);
        res.send({ message: "invalid user_name" });
    }
    else {

        let is_valid = await bcrypt.compare(user_password, db_user.password);

        if (is_valid) {
            const payload = { id: db_user.id, username: user_name, role:db_user.role}
            const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
            res.cookie("jwt_token", jwtToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.send({ url: "todo.html" });

        }
        else {
            res.status(400);
            res.send({ message: "invalid password" });
        }
    }

});



//all todos path
app.get("/todos", validation_middleware, async (req, res) => {
   const role=req.role;
   if (role!=="admin"){
    const id = req.id;
    const query = `SELECT * FROM todoList WHERE user_id=?`;
    const todos = await db.all(query,[id]);
    res.send(todos);
   }
    else{
    const usersList=await db.all(`select * from todoList`);
    res.send(usersList);
   }
  
});


//get todo by id 
app.get("/todo/:todoId", validation_middleware, async (req, res) => {
    let { todoId } = req.params;
    const query = `SELECT * FROM todoList WHERE id=${todoId}`;
    const todo = await db.get(query);
    res.send(todo);
});

//add todo path
app.post("/create", validation_middleware, async (req, res) => {
   let todos = await db.all(`SELECT * FROM todoList`);
    const id=req.id;
    const { title, description, due_date ,status} = req.body;
    
    const query = `INSERT INTO todoList(user_id,title,description,due_date,status) VALUES(?,?,?,?,?)`;
    await db.run(query,[id,title,description,due_date,status]);
    res.send({ message: "created" });

});

//todo update path
app.put("/todo/:todoId", validation_middleware, async (req, res) => {
    if (req.user==="user"){
    const { todoId } = req.params;
    const { title, description, due_date, status } = req.body;
    const query = `UPDATE todoList SET title=?,
    description=?,
    due_date=?
    WHERE
    id=?`;
    await db.run(query,[title,description,due_date,todoId]);
    res.send({ message: "updated" });}
    else{
        res.send("")
    }

});


//todo status change
app.put("/status/:todoId", validation_middleware, async (req, res) => {
    const { todoId } = req.params;
    const { status } = req.body;
    const query = `UPDATE todoList SET status=?
    WHERE
    id=?`;
    await db.run(query,[status,todoId]);
    res.send({ message: "updated" });
});

//todo delete path
app.delete("/todo/:todoId", validation_middleware, async (req, res) => {
    const { todoId } = req.params;
    const query = `DELETE FROM todoList WHERE id=?`;
    await db.run(query,[todoId]);
    res.send({ message: "deleted" });
});

//todos by status path
app.get("/todos/:status", validation_middleware, async (req, res) => {
    let { status } = req.params;
    const query = `SELECT * FROM todoList WHERE status=?`;
    const todos = await db.all(query,[status]);
    res.send(todos);
});

//todo by title
app.get("/title/:title", validation_middleware, async (req, res) => {
    let { title } = req.params;
    const query = `SELECT * FROM todoList WHERE title LIKE "%?%"`;
    const todos = await db.all(query,[title]);
    res.send(todos);
});

