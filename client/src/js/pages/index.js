import { $root } from "../constants.js";
import { ElementFactory } from "../factories/elementFactory.js";

const PAYLOAD_INDEX = 1

class Index {
  constructor() {
    // For verifying logged in
    const token = localStorage.getItem("accessToken");

    // if not logged in / authenticated render login and signup buttons
    if (!token) {
      $root.append(ElementFactory.loginButton(), ElementFactory.signupButton());
      return;
    }

    // Successfully logged in 
    const payload = this.parseTokenPayload(token)
    const role = payload.role;
    switch (role) {
      case "user":
        $root.append(ElementFactory.imageForm())
        break;

      case "admin":
        $root.html("Hello admin");
        break;
    }

    // Append a logout button regardless of role
    $root.append(ElementFactory.logoutButton())
  }


  parseTokenPayload(token) {
    // Get the header, payload, and signiature of the token
    const token_parts = token.split(".")
    // Decode the base 64 encoded string to a string
    const decoded_payload = atob(token_parts[PAYLOAD_INDEX])
    // Parse the string to json containing user info
    return JSON.parse(decoded_payload);
  }
}

new Index();
