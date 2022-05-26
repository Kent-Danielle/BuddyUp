'use strict';

/**
 * Redirect to the profile page if the user is logged in or the login page elsewise once the return button has been clicked.
 */
document.getElementById("return-button").addEventListener("click", function(e) {
  window.location.href = "/";
});