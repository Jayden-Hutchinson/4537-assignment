import { UI } from "../lang/en/user.js";
import { $root, HTML } from "./constants.js";

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

    // Handle submit
    form.on(HTML.EVENTS.SUBMIT, function (e) {
      e.preventDefault(); // prevent page reload
      const formData = {
        name: nameInput.val(),
        email: emailInput.val(),
        password: passwordInput.val(),
      };
      console.log("Form submitted:", formData);
      alert(`Welcome, ${formData.name}!`);
    });

    // Add the form to the root
    $root.append(form);
  }
}

new LogIn();
