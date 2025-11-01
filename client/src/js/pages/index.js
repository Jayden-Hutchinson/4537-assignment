import { UI } from "../../lang/en/user.js";

import { $root, HTML } from "../constants.js";

import { WindowManager } from "../managers/windowManager.js";

class Index {
  constructor() {
    const logInButton = $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.LOG_IN_BUTTON)
      .click(() => {
        WindowManager.logInPage();
      });

    const signUpButton = $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.SIGN_UP_BUTTON)
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
    $root.append(logInButton, signUpButton, imageForm);
  }
}

new Index();
