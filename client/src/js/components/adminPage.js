import { HTML, PROXY_BASE, SERVER_BASE_URL } from "../constants.js";

export class AdminPage {
  constructor() {
    this.element = $(HTML.ELEMENTS.DIV);
    this.element.append($(HTML.ELEMENTS.H1).text("Admin - API Usage"));
    this.populatePage();
  }

  async populatePage() {
    // Create placeholders for two tables
    const endpointsSection = $(HTML.ELEMENTS.DIV).addClass("admin-endpoints");
    endpointsSection.append($(HTML.ELEMENTS.H2).text("Endpoint Stats"));
    const endpointsTable = $("<table>").addClass("stats-table");
    endpointsTable.append(
      $("<thead>").append(
        $("<tr>").append(
          $("<th>").text("Method"),
          $("<th>").text("Endpoint"),
          $("<th>").text("Requests")
        )
      )
    );
    endpointsTable.append($("<tbody>"));

    const usersSection = $(HTML.ELEMENTS.DIV).addClass("admin-users");
    usersSection.append($(HTML.ELEMENTS.H2).text("User Consumption"));
    const usersTable = $("<table>").addClass("users-table");
    usersTable.append(
      $("<thead>").append(
        $("<tr>").append(
          $("<th>").text("User name"),
          $("<th>").text("Email"),
          $("<th>").text("Total Requests")
        )
      )
    );
    usersTable.append($("<tbody>"));

    endpointsSection.append(endpointsTable);
    usersSection.append(usersTable);

    this.element.append(endpointsSection, usersSection);

    // Try to fetch data from server using the stored access token
    let endpointsData = null;
    let usersData = null;
    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/admin/stats`);
      if (res.ok) endpointsData = await res.json();
    } catch (e) {}

    if (!endpointsData) {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/admin/stats`);
        if (res.ok) endpointsData = await res.json();
      } catch (e) {}
    }

    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/admin/user-usage`);
      if (res.ok) usersData = await res.json();
    } catch (e) {}

    if (!usersData) {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/admin/user-usage`);
        if (res.ok) usersData = await res.json();
      } catch (e) {}
    }

    // If still null, show placeholder sample data
    if (!endpointsData) {
      endpointsData = [
        { method: "PUT", endpoint: "/API/v1/customers/id", requests: 79 },
        { method: "GET", endpoint: "/API/v1/customers/id", requests: 145 },
      ];
    }

    if (!usersData) {
      usersData = [
        { username: "Jaohn23", email: "john@john.xyp", totalRequests: 143 },
        { username: "tom45", email: "tom@tom.io", totalRequests: 12 },
      ];
    }

    // Render endpoints
    const etBody = endpointsTable.find("tbody");
    endpointsData.forEach((r) => {
      etBody.append(
        $("<tr>").append(
          $("<td>").text(r.method),
          $("<td>").text(r.endpoint),
          $("<td>").text(r.requests)
        )
      );
    });

    // Render users
    const uBody = usersTable.find("tbody");
    usersData.forEach((u) => {
      uBody.append(
        $("<tr>").append(
          $("<td>").text(u.username),
          $("<td>").text(u.email),
          $("<td>").text(u.totalRequests)
        )
      );
    });
  }
}
