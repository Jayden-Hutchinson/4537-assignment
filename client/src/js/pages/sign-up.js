import { UI } from "../../lang/en/user.js";
import { $root, HTML } from "../constants.js";

class FormData {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class SignUp {
  constructor() {
    const form = $(HTML.ELEMENTS.FORM).attr({ id: HTML.IDS.SIGN_UP_FORM });

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
      .text(UI.TEXT.SIGN_UP_BUTTON);

    // Append all inputs and button to form
    form.append(emailInput, passwordInput, signUpButton);

    // Handle submit
    form.on(HTML.EVENTS.SUBMIT, function (event) {
      event.preventDefault(); // prevent page reload
      const formData = new FormData(emailInput.val(), passwordInput.val());

      console.log(formData);
    });

    // Add the form to the root
    $root.append(form);
  }
}

new SignUp();
