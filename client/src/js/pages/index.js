import { UI } from "../../lang/en/user.js";

import { $root, HTML } from "../constants.js";

import { WindowManager } from "../managers/windowManager.js";

class Index {
  constructor() {
    const logInButton = $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.LOGIN_BUTTON)
      .click(() => {
        WindowManager.logInPage();
      });

    const signUpButton = $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.SIGNUP_BUTTON)
      .click(() => {
        WindowManager.signUpPage();
      });

    const imageForm = $(HTML.ELEMENTS.FORM);
    const imageInput = $(HTML.ELEMENTS.INPUT).attr({ type: HTML.TYPES.FILE });
    const submitButton = $(HTML.ELEMENTS.BUTTON)
      .attr({
        type: HTML.TYPES.SUBMIT,
      })
      .text(UI.TEXT.SUBMIT_BUTTON);

    imageForm.append(imageInput, submitButton);
    imageForm.on(HTML.EVENTS.SUBMIT, (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      console.log(file);
    });

    const token = localStorage.getItem("accessToken");

    if (!token) {
      $root.append(logInButton, signUpButton);
      return;
    }

    console.log(token);

    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(payload);
    const role = payload.role;

    if (role === "admin") {
      $root.html("Hello admin");
    } else if (role === "user") {
      $root.html("Hello user");
    }

    const logoutButton = $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.LOGOUT_BUTTON)
      .click(() => {
        localStorage.removeItem("accessToken");
        WindowManager.indexPage();
      });
    $root.append(logoutButton);
  }
}

new Index();
