export const Role = {
  USER: "user",
  ADMIN: "admin",
};

export class User {
  constructor(email, name, role) {
    this.email = email;
    this.name = name;
    this.role = role;
  }
}
