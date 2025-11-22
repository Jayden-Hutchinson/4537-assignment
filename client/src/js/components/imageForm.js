import { UI } from "../../lang/en/user.js";
import { HTML } from "../constants.js";

export class ImageForm {
  constructor() {
    this.element = $(HTML.ELEMENTS.FORM);
    const formTitle = $(HTML.ELEMENTS.H2);
    const imageInput = $(HTML.ELEMENTS.INPUT);
    const imagePreview = $(HTML.ELEMENTS.IMG);
    const load_message = $(HTML.ELEMENTS.DIV);
    const submitButton = $(HTML.ELEMENTS.BUTTON);

    // FORM TITLE
    formTitle.text("Upload an image to generate a caption");

    // IMAGE INPUT
    imageInput.attr({ type: HTML.TYPES.FILE });

    // When image is uploaded display the image
    imageInput.on(HTML.EVENTS.CHANGE, (event) => {
      imagePreview.hide();
      const file = imageInput[0].files[0];
      if (!file) {
        console.log("no file");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        if (isValidFile(file)) {
          console.log("File Uploaded.");
          load_message.empty();
          imagePreview.attr("src", event.target.result);
          imagePreview.show();
          submitButton.show();
        } else {
          console.log("File must be jpeg or png!");
          load_message.text("File must be jpeg or png!");
        }
      };
      reader.readAsDataURL(file);
    });

    // SUBMIT BUTTON
    submitButton
      .attr({
        type: HTML.TYPES.SUBMIT,
      })
      .text(UI.TEXT.SUBMIT_BUTTON)
      .hide();

    // Handle Form Submit
    this.element.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      console.log("Form submitted with file:", file);

      if (!file) {
        alert("Please select an image first");
        return;
      }

      try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async function (e) {
          const base64Image = e.target.result;

          // Get token from localStorage
          const token = localStorage.getItem("accessToken");

          // Call API
          load_message.html("Analyizing Image");
          const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await response.json();
          if (response.ok) {
            // Display the caption
            load_message.text(`Description: ${data.caption}`);
            console.log("Description:", data.caption);
            submitButton.show();
          } else {
            alert("Error:" + (data.error || "Failed to analyze image"));
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to analyze image: " + error.message);
      } finally {
        submitButton.hide();
      }
    });

    this.element.append(
      formTitle,
      imageInput,
      imagePreview,
      load_message,
      submitButton
    );
  }
}

function isValidFile(file) {
  return file.type == "image/jpeg" || file.type == "image/png";
}
