import { UI } from "../../lang/en/user.js";
import { $root, HTML, SERVER_BASE_URL } from "../constants.js";
import { WindowManager } from "../managers/windowManager.js";

class FormData {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

const PAGE_TITLE = "Sign Up";
const SIGNUP_USER_URL = `${SERVER_BASE_URL}/signup_user`;

class SignUp {
  constructor() {
    const form = $(HTML.ELEMENTS.FORM).attr({ id: HTML.IDS.SIGNUP_FORM });
    const pageTitle = $(HTML.ELEMENTS.H1).text(PAGE_TITLE);
    const err_message = $(HTML.ELEMENTS.DIV);

    const emailInput = $(HTML.ELEMENTS.INPUT).attr({
      type: HTML.TYPES.EMAIL,
      name: HTML.NAMES.EMAIL,
      placeholder: HTML.PLACEHOLDERS.EMAIL,
      required: true,
    });

    const passwordInput = $(HTML.ELEMENTS.INPUT).attr({
      type: HTML.TYPES.PASSWORD,
      name: HTML.NAMES.PASSWORD,
      placeholder: HTML.PLACEHOLDERS.PASSWORD,
      required: true,
    });

    // Create submit button
    const signUpButton = $(HTML.ELEMENTS.BUTTON)
      .attr({ type: HTML.TYPES.SUBMIT })
      .text(UI.TEXT.SIGNUP_BUTTON);

    // Append all inputs and button to form
    form.append(emailInput, passwordInput, err_message, signUpButton);

    // Handle submit
    form.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault(); // prevent page reload

      const formData = new FormData(emailInput.val(), passwordInput.val());

      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      const response = await fetch(SIGNUP_USER_URL, request);
      const data = await response.json();

      if (!response.ok) {
        err_message.text(data.error);
        console.log("Error:", data.error);
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("request_limit", 20);
      WindowManager.indexPage();
    });

    // Add the form to the root
    $root.append(pageTitle, form);
  }
}

new SignUp();
