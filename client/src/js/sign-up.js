
class SignUp {
    constructor() {
        // Root element where we'll attach everything
        const root = $("#root");

        // Create a form
        const form = $("<form>").attr("id", "sign-up-forum");

        // Create input fields
        const nameInput = $("<input>")
            .attr({
                type: "text",
                name: "name",
                placeholder: "Name",
                required: true
            });

        const emailInput = $("<input>")
            .attr({
                type: "email",
                name: "email",
                placeholder: "Email",
                required: true
            });

        const passwordInput = $("<input>")
            .attr({
                type: "password",
                name: "password",
                placeholder: "Password",
                required: true
            });

        // Create submit button
        const submitButton = $("<button>")
            .attr("type", "submit")
            .text("Sign Up");

        // Append all inputs and button to form
        form.append(nameInput, emailInput, passwordInput, submitButton);

        // Handle submit
        form.on("submit", function (e) {
            e.preventDefault(); // prevent page reload
            const formData = {
                name: nameInput.val(),
                email: emailInput.val(),
                password: passwordInput.val()
            };
            console.log("Form submitted:", formData);
            alert(`Welcome, ${formData.name}!`);
        });

        // Add the form to the root
        root.append(form);
    }
}

new SignUp()