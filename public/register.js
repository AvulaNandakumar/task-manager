
const nameEl = document.getElementById("name");
const roleEl= document.getElementById("role");
const passwordEl = document.getElementById("password");
const n_req = document.getElementById("name-required");
const p_req = document.getElementById("password-required");
const sub_btn = document.getElementById("sub-btn");
const s_registered = document.getElementById("s-registered");
console.log(s_registered);

sub_btn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (nameEl.value === "") {
        n_req.classList.add("display");
    }
    else {
        n_req.classList.remove("display")

    }

    
    if (passwordEl.value === "") {
        p_req.classList.add("display");
    }
    else {
        p_req.classList.remove("display")
    }


    if (nameEl.value !== "" && passwordEl.value !== "") {

        let name = "";
        let password = "";

        let options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                name: nameEl.value,
                password: passwordEl.value,
                role:roleEl.value,
            })
        }

        try {
            let res = await fetch("/register", options);

            if ( res.status === 201) {
                s_registered.classList.add("display");
               
               setTimeout(() => {
                window.location.href = "login.html";
               }, 1000); 

            }
          

        }
        catch (e) {
            console.log(e);
        }
    }
});