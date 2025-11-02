import { PAGES } from "../constants.js";

export class WindowManager {
  static indexPage() {
    window.location.href = PAGES.INDEX;
  }

  static signUpPage() {
    window.location.href = PAGES.SIGN_UP;
  }

  static logInPage() {
    window.location.href = PAGES.LOG_IN;
  }
}
