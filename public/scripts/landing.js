'use strict';

const textarea = document.querySelector("textarea");

/**
 * A function to add a limit to number of characters inside the textarea.
 */
textarea.addEventListener("input", ({
  currentTarget: target
}) => {
  const maxLength = target.getAttribute("maxlength");
  const currentLength = target.value.length;

  if (currentLength >= maxLength) {
    return document.getElementById("textarea_remaining_char").innerText = "You have reached the maximum number of characters.";
  }

  document.getElementById("textarea_remaining_char").innerText = (maxLength - currentLength) + " characters left";
});

/**
 * A function to fetch the form and send to server.
 */
document.getElementById("submit").addEventListener("click", (e) => {
    e.preventDefault();
    let form = document.getElementById("requestForm");
    let data = {
      email: form.email.value,
      username: form.username.value,
      reason: form.reason.value
    };
    fetch("/user/adminPromotion", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      .then(function (result) {
        return result.json();
      })
      .then(function (result) {
        if (result.success == "true") {
          window.location.replace("/user/login");
        } else {
          let inputs = document.querySelectorAll(".inputFields");
          inputs.forEach((input) => input.style.backgroundColor = "rgba(255, 255, 255, 0)");
          document.getElementById("errorMsg").innerText = result.reason;
          if (result.type != null) {
            document.getElementById(result.type).style.backgroundColor = 'var(--accent-light)';
          }
        }
      });
});