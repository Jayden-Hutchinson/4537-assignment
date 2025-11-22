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
    imageForm.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      if (!file) {
        alert("Please select an image first");
        return;
      }

      // Disable button while processing
      submitButton.prop("disabled", true).text("Analyzing...");

      try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async function (e) {
          const base64Image = e.target.result;

          // Get token from localStorage
          const token = localStorage.getItem("accessToken");

          // Call API
          const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ image: base64Image })
          });

          const data = await response.json();

          if (response.ok) {
            // Display the caption
            const caption = $(HTML.ELEMENTS.DIV)
              .addClass("caption-result")
              .html(`<h3>Caption:</h3><p>${data.caption}</p>`);

            imageForm.append(caption);
            console.log("Caption:", data.caption);
          } else {
            alert("Error: " + (data.error || "Failed to analyze image"));
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to analyze image: " + error.message);
      } finally {
        submitButton.prop("disabled", false).text(UI.TEXT.SUBMIT_BUTTON);
      }
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
