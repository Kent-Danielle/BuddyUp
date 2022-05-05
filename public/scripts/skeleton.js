//--------------------------------------------------------
// Loads the navbar and footer if the container is found
//--------------------------------------------------------
function loadSkeleton() {
  $("#navbarPlaceholder").load("../html/navbar.html");
  $("#tabbarPlaceholder").load("../html/tabbar.html");
}
loadSkeleton(); //invoke the function
