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

    // FORM TITLE
    formTitle.text("Upload an image to generate a caption");

    // IMAGE INPUT
    imageInput.attr({ type: HTML.TYPES.FILE });

    // Preview when a file is selected
    imageInput.on(HTML.EVENTS.CHANGE, (event) => {
      imagePreview.hide();
      submitButton.hide();
      const file = imageInput[0].files[0];
      if (!file) return;

      if (!isValidFile(file)) {
        load_message.text("File must be JPEG or PNG!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        load_message.empty();
        imagePreview.attr("src", e.target.result).show();
        submitButton.show();
      };
      reader.readAsDataURL(file);
    });

    // SUBMIT BUTTON
    submitButton
      .attr({ type: HTML.TYPES.SUBMIT })
      .text(UI.TEXT.SUBMIT_BUTTON)
      .hide();

    // FORM SUBMIT HANDLER
    this.element.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      if (!file) {
        alert("Please select an image first");
        return;
      }

      if (!isValidFile(file)) {
        load_message.text("File must be JPEG or PNG!");
        return;
      }

      // Reset UI
      load_message.html("Analyzing Image...");
      submitButton.hide();

      try {
        // Convert image to base64
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Prepare headers (include token if present)
        const token = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        // Send to your backend (note: using SERVER_BASE_URL from constants)
        const response = await fetch(
          `${SERVER_BASE_URL}/api/blip/analyze-image`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ image: base64Image }),
          }
        );

        const quotaHeader =
          response.headers.get("x-quota-exceeded") ||
          response.headers.get("X-Quota-Exceeded");

        if (response.ok) {
          const data = await response.json();
          let message = `Description: ${data.caption || data.description}`;

          if (data.enhanced_description) {
            message += `<br><br>Funny caption: ${data.enhanced_description}`;
          } else {
            message += `<br><br>No funny caption generated.`;
          }

          load_message.html(message);

          if (quotaHeader) {
            const warn = $(HTML.ELEMENTS.DIV)
              .addClass("quota-warning")
              .text(
                "You have reached your free API quota. Further requests may be limited."
              );
            load_message.after(warn);
          }
        } else {
          // Non-200 response
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error("Image analysis failed:", error);
        load_message.html("Error analyzing image");
        alert("Failed to analyze image: " + error.message);
      } finally {
        // Always re-enable the button after operation (optional)
        submitButton.show();
      }
    });

    // Append everything to the form
    this.element.append(
      formTitle,
      imageInput,
      imagePreview,
      load_message,
      submitButton
    );
  }
}

// Helper
function isValidFile(file) {
  return file.type === "image/jpeg" || file.type === "image/png";
}
