import { UI } from "../../lang/en/user.js";
import { $root, HTML, BASE_URL } from "../constants.js";
import { WindowManager } from "../managers/windowManager.js";

class FormData {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class SignUp {
  constructor() {
    const form = $(HTML.ELEMENTS.FORM).attr({ id: HTML.IDS.SIGNUP_FORM });

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
    form.append(emailInput, passwordInput, signUpButton);

    // Handle submit
    form.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault(); // prevent page reload

      const formData = new FormData(emailInput.val(), passwordInput.val());
      console.log(formData);

      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      try {
        const url = `${BASE_URL}/api/signup`;
        console.log(url);
        const response = await fetch(url, request);
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          localStorage.setItem("accessToken", data.accessToken);
          WindowManager.indexPage();
        } else {
          console.log(data.error || "Sign up failed");
        }
      } catch (err) {
        console.log("Signup error:", err);
        console.log("Server error");
      }
    });

    // Add the form to the root
    $root.append(form);
  }
}

new SignUp();
