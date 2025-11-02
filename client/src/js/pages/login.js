import { UI } from "../../lang/en/user.js";
import { $root, HTML } from "../constants.js";
import { WindowManager } from "../managers/windowManager.js";

class FormData {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class LogIn {
  constructor() {
    // Create a form
    const form = $(HTML.ELEMENTS.FORM).attr("id", "sign-up-forum");

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
    const logInButton = $(HTML.ELEMENTS.BUTTON)
      .attr({ type: HTML.TYPES.SUBMIT })
      .text(UI.TEXT.LOGIN_BUTTON);

    // Append all inputs and button to form
    form.append(emailInput, passwordInput, logInButton);

    // Handle submit - send credentials to server and store access token
    form.on(HTML.EVENTS.SUBMIT, async function (e) {
      e.preventDefault(); // prevent page reload

      const formData = new FormData(emailInput.val(), passwordInput.val());
      console.log(formData);

      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      try {
        const resp = await fetch("http://localhost:3000/api/login", request);
        const data = await resp.json();

        if (!resp.ok) {
          // show simple alert for errors (could be improved to render in DOM)
          alert(data.error || "Login failed");
          return;
        }

        const token = data.accessToken;

        if (token) {
          // store token for use on subsequent requests
          localStorage.setItem("accessToken", token);
          console.log("Login successful");
          // Optionally redirect or refresh the app state
          WindowManager.indexPage();
        } else {
          console.log("Login succeeded but no token was returned");
        }
      } catch (err) {
        console.error("Login error", err);
      }
    });

    // Add the form to the root
    $root.append(form);
  }
}

new LogIn();
