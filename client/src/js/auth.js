import { PAGES } from "./constants.js";
import { WindowManager } from "./managers/windowManager.js";

const USER = "user";
const ADMIN = "admin";

export class Authentication {
  static getUser() {}
  static setUser() {}

  static navigateToRolePage() {
    const user = this.getUser();
    console.log(user);

    if (user) {
      // if there is a user navigate to new page based on role
      const pages = {
        USER: WindowManager.userPage,
        ADMIN: WindowManager.adminPage,
      };
      pages[user.role]();
    } else {
      // otherwise bring them to the landing page if not already
      if (!window.location.pathname.endsWith(PAGES.INDEX)) {
        WindowManager.indexPage();
      }
    }
  }
}
