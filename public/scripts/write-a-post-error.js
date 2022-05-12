document.getElementById("submit").addEventListener("click", async(e) =>{
    e.preventDefault();
    let form = document.getElementById("input-container");
    let formData = new FormData(form);
    console.log(tinymce.get("tinytext").getContent({format : 'raw'}));
    formData.set("content", tinymce.get("tinytext").getContent({format : 'raw'}));
    fetch("/user/write", {
        method: "POST",
        body: formData
    }).then(function(result) {
        return result.json();
    }).then(function(result){
        if(result.success == "true"){
            window.location.replace("/user/profile");
        } else {
            document.getElementById("errorMsg").innerHTML = result.message;
        }
    });
});