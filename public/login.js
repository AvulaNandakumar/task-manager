
let userNameElement = document.getElementById("username");
let passwordElement = document.getElementById("password");
let submitElement = document.getElementById("submit");
let nameError = document.getElementById("userNameError");
let passwordError = document.getElementById("passwordError");
let loginSuccess = document.getElementById("loginSuccess");

submitElement.addEventListener("click", async (event) => {
    event.preventDefault()
    let data = {
        user_name: userNameElement.value,
        user_password: passwordElement.value,
    }
    let options = {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            user_name: userNameElement.value,
            user_password: passwordElement.value,
        }),
    };
    try {

        let response = await fetch("/login", options);
        let json_data = await response.json();
        if (json_data.message === "invalid user_name") {
            nameError.classList.add("display");
        }
        else {
            nameError.classList.remove("display");
            loginSuccess.classList.remove("display");
        }
        if (json_data.message === "invalid password") {
            passwordError.classList.add("display");
        }
        else {
            passwordError.classList.remove("display");
            loginSuccess.classList.remove("display");
        }
        if (json_data.url !== undefined) {
            nameError.classList.remove("display");
            passwordError.classList.remove("display");
            loginSuccess.classList.add("display");
            userNameElement.value = "";
            passwordElement.value = "";
            window.location.href = json_data.url;
            loginSuccess.classList.remove("display");

        }
    } catch (e) {

        console.log(e);
    }

});


