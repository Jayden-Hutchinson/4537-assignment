import { UI } from "../../lang/en/user.js";
import { $root, HTML } from "../constants.js";

class Payload {
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
      .text(UI.TEXT.LOG_IN_BUTTON);

    // Append all inputs and button to form
    form.append(emailInput, passwordInput, logInButton);

    // Handle submit - send credentials to server and store access token
    form.on(HTML.EVENTS.SUBMIT, async function (e) {
      e.preventDefault(); // prevent page reload

      const payload = new Payload(emailInput.val(), passwordInput.val());

      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      try {
        const resp = await fetch("/api/login", request);
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
          alert("Login successful");
          // Optionally redirect or refresh the app state
          window.location.href = "/";
        } else {
          alert("Login succeeded but no token was returned");
        }
      } catch (err) {
        console.error("Login error", err);
        alert("An error occurred during login");
      }
    });

    // Add the form to the root
    $root.append(form);
  }
}

new LogIn();
