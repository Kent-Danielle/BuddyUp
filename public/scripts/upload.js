document.getElementById("file-container").addEventListener("click", function(){
    document.getElementById("pfp").click();
});

document.getElementById("pfp").addEventListener("change", function(){
    document.getElementById("file-label").innerHTML = document.getElementById("pfp").files[0].name;
})