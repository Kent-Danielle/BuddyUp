//const modalText = document.getElementById("modalText");
//const loggedInName = document.getElementById("name").innerText;
function createListener() {
    const deleteBtn = document.querySelectorAll(".delete-post-button");
    const editBtn = document.querySelectorAll(".edit-post-button");
    const cancelBtn = document.getElementById("noBtn");
    const confirmBtn = document.getElementById("yesBtn");
    var confirmModal = document.getElementById("confirmDeleteModal");
    confirmModal.style.setProperty("display", "none", "important");
    for (let i = 0; i < deleteBtn.length; i++) {
        deleteBtn[i].addEventListener("click", (event) => {
            event.preventDefault();
            confirmBtn.style.setProperty("display", "inline-block", "important");
            confirmModal.style.setProperty("display", "flex", "important");

            confirmBtn.addEventListener("click", async (event2) =>{
                event2.preventDefault();
                let data = {
                    id: deleteBtn[i].value,
                }
                await fetch("/user/deletePost/", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                }).then(function(){
                    window.location.reload();
                });
            });
        });
    }

    cancelBtn.addEventListener("click", (event) => {
        confirmModal.style.setProperty("display", "none", "important");
    });
}
createListener();