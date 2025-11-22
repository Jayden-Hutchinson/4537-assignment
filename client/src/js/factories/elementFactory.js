import { UI } from "../../lang/en/user.js";
import { HTML } from "../constants.js";
import { WindowManager } from "../managers/windowManager.js";

export class ElementFactory {
  static imageForm() {
    const preview = $(HTML.ELEMENTS.IMG);
    const imageForm = $(HTML.ELEMENTS.FORM);
    const imageInput = $(HTML.ELEMENTS.INPUT).attr({ type: HTML.TYPES.FILE });
    const submitButton = $(HTML.ELEMENTS.BUTTON)
      .attr({
        type: HTML.TYPES.SUBMIT,
      })
      .text(UI.TEXT.SUBMIT_BUTTON);

    imageForm.html("Select an image to generate a caption");

    imageForm.append(imageInput, preview, submitButton);

    imageInput.on(HTML.EVENTS.CHANGE, (event) => {
      const file = imageInput[0].files[0];
      if (!file) {
        console.log("no file");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        preview.attr("src", event.target.result);
        preview.show();
      };
      reader.readAsDataURL(file);
    });

    // Handle Submit
    imageForm.on(HTML.EVENTS.SUBMIT, (event) => {
      event.preventDefault();
      console.log("submit");
    });

    return imageForm;
  }

  static logoutButton() {
    return $(HTML.ELEMENTS.BUTTON)
      .addClass("logout-button")
      .text(UI.TEXT.LOGOUT_BUTTON)
      .click(() => {
        localStorage.removeItem("accessToken");
        WindowManager.indexPage();
      });
  }

  static signupButton() {
    return $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.SIGNUP_BUTTON)
      .click(() => {
        WindowManager.signUpPage();
      });
  }

  static loginButton() {
    return $(HTML.ELEMENTS.BUTTON)
      .text(UI.TEXT.LOGIN_BUTTON)
      .click(() => {
        WindowManager.logInPage();
      });
  }
}
