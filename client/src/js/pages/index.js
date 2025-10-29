import { UI } from "../../lang/en/user.js";
import { Authentication } from "../auth.js";

import { $root, HTML } from "../constants.js";

import { WindowManager } from "../managers/windowManager.js";

class Index {
  constructor() {
    $(document).ready(() => Authentication.navigateToRolePage());

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

    $root.append(logInButton, signUpButton);
  }
}

new Index();
