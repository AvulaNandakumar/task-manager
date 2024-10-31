let addTaskBtn = document.getElementById("addTaskBtn");
const title = document.getElementById('task-title');
const description = document.getElementById('task-desc');
const dueDate = document.getElementById('task-due');

let token = null;

//access token 
const getToken = async () => {
  let response = await fetch("/token", { method: "GET" });
  let jsondata = await response.json();
  token = jsondata.token;
}

getToken();

//add task to database
const addTask = async () => {
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      title: `${title.value}`,
      description: `${description.value}`,
      due_date: dueDate.value,
      status: "false"
    }),
  };
  let response = await fetch("/create", options);
  let jsondata = await response.json();
  console.log(jsondata);
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-due').value = '';

  renderTasks();

}

addTaskBtn.addEventListener("click", addTask);


//render tasks from db
const renderTasks = async () => {

  let res = await fetch("/token", { method: "GET" });
  let json = await res.json();
  let token = json.token;

  let response = await fetch("/todos", {
    method: "GET",
    headers: {
      "content-type": "application/json",
      authorization: token,
    }

  });
  let tasks = await response.json();
  createTask(tasks);
}

renderTasks();


//task creation
function createTask(tasks) {
  let status_text = "Incomplete";
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');

    if (task.status === "true") {

      status_text = "Completed";
      li.className = task.status ? 'completed' : '';
    }
    else {

      status_text = "Incomplete";
    }
    li.innerHTML = `
      <span>${task.title} - ${task.description} (Due: ${task.due_date})</span>
      <div>
        <button class="edit" onclick="edit(${task.id})">Edit</button>
        <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
        <button onclick="statusChange(${task.id})">${status_text}</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}



let db_status_value = "false";

//status change in db
const status_change_in_db = async (id) => {

  let todo_id = id;

  if (db_status_value === "false") {
    db_status_value = "true";
  }
  else {
    db_status_value = "false";
  }

  let response = await fetch(`/status/${todo_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({ status: `${db_status_value}` }),
  });
  let jsondata = await response.json();


}

//status change
function statusChange(id) {

  status_change_in_db(id);
  renderTasks();
}

//edit task in db
const edittask_from_db = async (id) => {

  const task_id = id;
  let response = await fetch(`/todo/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      id: `${task_id}`,
      title: `${title.value}`,
      description: `${description.value}`,
      due_date: `${dueDate.value}`,
    })

  });
  let jsondata = await response.json();

  console.log(jsondata)
}

//get task details to edit
const get_task_by_id_from_db = async (id) => {
  const todo_id = id;
  let response = await fetch(`/todo/${todo_id}`, {
    method: "GET",
    headers: {
      authorization: token
    }
  });
  let jsondata = await response.json();
  title.value = jsondata.title;
  description.value = jsondata.description;
  dueDate.value = jsondata.due_date;
  edittask_from_db(todo_id);
}

//edit task
function edit(id) {

  let task_id = id;

  get_task_by_id_from_db(task_id);

  deleteTask(task_id);

}

//delete task from db
const deletetask_from_db = async (id) => {
  const task_id = id;
  let response = await fetch(`/todo/${task_id}`, {
    method: "DELETE",
    headers: {
      authorization: token,
    },
    body: JSON.stringify({ id: `${task_id}` }),
  })
  let jsondata = await response.json();
  console.log(jsondata);
}

//delete task
function deleteTask(id) {
  const delete_id = id;
  deletetask_from_db(delete_id);
  renderTasks();
}

//get task by status
const task_by_status = async (status) => {

  let response = await fetch(`/todos/${status}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      authorization: token,
    }
  });
  let tasks = await response.json();
  console.log(tasks)
  createTask(tasks);

}


//task filter
function filterTasks() {

  const filter = document.getElementById('filter').value;

  if (filter === "all") {
    renderTasks();
  }
  else if (filter === "incomplete") {
    task_by_status("false");
  }
  else if (filter === "completed") {
    task_by_status("true");
  }
}

filterTasks();


const search = document.getElementById('search');
//task serach
const  search_task=async()=>{

  let response = await fetch(`/title/${search.value}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      authorization: token,
    }
  });
  let tasks = await response.json();
  console.log(tasks)
  createTask(tasks);


}

search.addEventListener("keyup",()=>{
  search_task();
});