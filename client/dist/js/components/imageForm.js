import { UI } from "../../lang/en/user.js";
import { HTML, SERVER_BASE_URL } from "../constants.js";

export class ImageForm {
  constructor() {
    this.element = $(HTML.ELEMENTS.FORM);
    const formTitle = $(HTML.ELEMENTS.H2);
    const imageInput = $(HTML.ELEMENTS.INPUT);
    const imagePreview = $(HTML.ELEMENTS.IMG);
    const load_message = $(HTML.ELEMENTS.DIV);
    const submitButton = $(HTML.ELEMENTS.BUTTON);

    formTitle.text("Upload an image to generate a caption");
    imageInput.attr({ type: HTML.TYPES.FILE });

    imageInput.on(HTML.EVENTS.CHANGE, (event) => {
      imagePreview.hide();
      submitButton.hide();
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

    submitButton
      .attr({ type: HTML.TYPES.SUBMIT })
      .text(UI.TEXT.SUBMIT_BUTTON)
      .hide();

    this.element.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      console.log("Form submitted with file:", file);

      if (!file) {
        alert("Please select an image first");
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async function (e) {
          const base64Image = e.target.result;
          const token = localStorage.getItem("accessToken");
          const headers = { "Content-Type": "application/json" };
          if (token) headers.Authorization = `Bearer ${token}`;

          load_message.html("Analyzing Image");
          const response = await fetch(`${SERVER_BASE_URL}/api/blip/analyze-image`, {
            method: "POST",
            headers,
            body: JSON.stringify({ image: base64Image }),
          });

          const quotaHeader = response.headers.get("x-quota-exceeded") || response.headers.get("X-Quota-Exceeded");

          if (response.ok) {
            const data = await response.json();
            load_message.text(`Description: ${data.caption}`);
            console.log("Caption:", data.caption);
            if (quotaHeader) {
              const warn = $(HTML.ELEMENTS.DIV).addClass("quota-warning").text(
                "You have reached your free API quota. Further requests will still work but may be limited."
              );
              load_message.after(warn);
            }
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

    this.element.append(formTitle, imageInput, imagePreview, load_message, submitButton);
  }
}

function isValidFile(file) {
  return file.type == "image/jpeg" || file.type == "image/png";
}
