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

    // FORM SUBMIT HANDLER — NOW WITH COMPRESSION
    this.element.on(HTML.EVENTS.SUBMIT, async (event) => {
      event.preventDefault();

      const file = imageInput[0].files[0];
      if (!file || !isValidFile(file)) {
        alert("Please select a valid JPEG/PNG image");
        return;
      }

      load_message.html("Compressing image...");
      submitButton.hide();

      try {
        // COMPRESS + RESIZE IMAGE (this is the magic)
        const compressedBlob = await compressImage(file, 1024, 0.8); // max 1024px, 80% quality
        const compressedSizeKB = (compressedBlob.size / 1024).toFixed(1);
        console.log(`Compressed to ${compressedSizeKB} KB`);

        load_message.html(`<div class="loader"></div>`);

        // Convert compressed image to base64
        const base64Image = await blobToBase64(compressedBlob);

        // Prepare auth
        const token = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        // Send to server
        const request = {
          method: "POST",
          headers,
          body: JSON.stringify({ image: base64Image }),
        };

        const url = `${SERVER_BASE_URL}/api/analyze-image`;

        const response = await fetch(url, request);

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 413) {
            throw new Error("Image still too large — try a smaller photo");
          }
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        console.log(data);

        let message = `Description: ${
          data.caption || data.description || "No caption"
        }`;
        if (data.enhanced_description) {
          message += `<br><br>Funny caption: ${data.enhanced_description}`;
        } else {
          message += `<br><br>No funny caption generated.`;
        }

        load_message.html(message);

        // Quota warning
        const quotaHeader =
          response.headers.get("x-quota-exceeded") ||
          response.headers.get("X-Quota-Exceeded");
        if (quotaHeader) {
          const warn = $(HTML.ELEMENTS.DIV)
            .addClass("quota-warning")
            .text("Free API quota reached — further requests may be limited.");
          load_message.after(warn);
        }
      } catch (error) {
        console.error("Image analysis failed:", error);
        load_message.html(`Error: ${error.message}`);
        alert("Failed to analyze image: " + error.message);
      } finally {
        submitButton.show();
      }
    });

    // Append elements
    this.element.append(
      formTitle,
      imageInput,
      imagePreview,
      load_message,
      submitButton
    );
  }
}

// HELPER: Resize & compress image
async function compressImage(file, maxSize = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Resize if larger than maxSize
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(resolve, file.type, quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

// HELPER: Blob → base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// HELPER: File validation
function isValidFile(file) {
  return file.type === "image/jpeg" || file.type === "image/png";
}
