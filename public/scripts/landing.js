'use strict';

const textarea = document.querySelector("textarea");

textarea.addEventListener("input", ({ currentTarget: target }) => {
  const maxLength = target.getAttribute("maxlength");
  const currentLength = target.value.length;

  if (currentLength >= maxLength) {
    return document.getElementById("textarea_remaining_char").innerText = "You have reached the maximum number of characters.";
  }

  document.getElementById("textarea_remaining_char").innerText =  (maxLength - currentLength) + " characters left";
});