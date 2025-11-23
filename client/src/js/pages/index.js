import { $root, HTML } from "../constants.js";
import { UI } from "../../lang/en/user.js";
import { WindowManager } from "../managers/windowManager.js";

import { ImageForm } from "../components/imageForm.js";
import { AdminPage } from "../components/adminPage.js";
import { UserProfile } from "../components/userProfile.js";

const PAYLOAD_INDEX = 1;
const PAGE_TITLE = "Caption Generator";

class Index {
  constructor() {
    // For verifying logged in
    const token = localStorage.getItem("accessToken");
    const pageTitle = $(HTML.ELEMENTS.H1).text(PAGE_TITLE);

    $root.append(pageTitle);
    // if not logged in / authenticated render login and signup buttons
    if (!token) {
      const loginButton = $(HTML.ELEMENTS.BUTTON)
        .text(UI.TEXT.LOGIN_BUTTON)
        .click(() => {
          WindowManager.logInPage();
        });
      const signupButton = $(HTML.ELEMENTS.BUTTON)
        .text(UI.TEXT.SIGNUP_BUTTON)
        .click(() => {
          WindowManager.signUpPage();
        });

      $root.append(loginButton, signupButton);
      return;
    }

    // Successfully logged in
    const payload = this.parseTokenPayload(token);
    const role = payload.role;
    console.log(`Logged in as ${payload.email}`);

    switch (role) {
      case "user":
        const imageForm = new ImageForm();
        const profile = new UserProfile();
        $root.append(profile.element);
        $root.append(imageForm.element);
        break;

      case "admin":
        const adminPage = new AdminPage();
        $root.html(adminPage.element);
        break;
    }

    // Append a logout button regardless of role
    const logoutButton = $(HTML.ELEMENTS.BUTTON)
      .addClass("logout-button")
      .text(UI.TEXT.LOGOUT_BUTTON)
      .click(() => {
        localStorage.removeItem("accessToken");
        WindowManager.indexPage();
      });
    $root.append(logoutButton);
  }

  parseTokenPayload(token) {
    // Get the header, payload, and signiature of the token
    const token_parts = token.split(".");
    // Decode the base 64 encoded string to a string
    const decoded_payload = atob(token_parts[PAYLOAD_INDEX]);
    // Parse the string to json containing user info
    return JSON.parse(decoded_payload);
  }
}

new Index();
