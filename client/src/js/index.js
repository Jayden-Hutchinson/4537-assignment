const ROOT_ELEMENT = "#root"

const LINK = "<a>"
const BUTTON = "<button>"

const PAGES = {
    SIGN_IN: "sign-in.html",
    SIGN_UP: "sign-up.html"
}

class Index {
    constructor() {
        this.root = $(ROOT_ELEMENT);

        this.signInButton = $(BUTTON).text("Sign In").click(() => {
            this.toPage(PAGES.SIGN_IN)
        });

        this.signUpButton = $(BUTTON).text("Sign Up").click(() => {
            this.toPage(PAGES.SIGN_UP)
        });

        this.root.append(this.signInButton).append(this.signUpButton);
    }

    toPage = (page) => {
        window.location.href = page;
    }

}

new Index();