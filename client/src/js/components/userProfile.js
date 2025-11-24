import { HTML, PROXY_BASE, SERVER_BASE_URL } from "../constants.js";
import { UI } from "../../lang/en/user.js";

export class UserProfile {
  constructor() {
    this.element = $(HTML.ELEMENTS.DIV);
    this.element.append($(HTML.ELEMENTS.H2).text("Your API Usage"));
    this.container = $(HTML.ELEMENTS.DIV).addClass("user-usage");
    this.element.append(this.container);
    this.load();
  }

  async load() {
    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Primary: try configured server base URL
    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/user/usage`, { method: "GET", headers });
      if (!res.ok) {
        // show error message for unauthorized or other statuses
        this.container.html(`<p>Unable to load usage data from server (status ${res.status}).</p>`);
        return;
      }
      const json = await res.json();
      this.render(json);
      return;
    } catch (err) {
      console.error("Failed to fetch user usage:", err);
      this.container.html("<p>Unable to load usage data from server.</p>");
    }
  }

  render(data) {
    // Expected data: { total: number, perEndpoint: [{ method, endpoint, count }] }
    this.container.empty();
    const total = data.total ?? 0;
    this.container.append($(HTML.ELEMENTS.DIV).html(`<strong>Total requests:</strong> ${total}`));

    if (Array.isArray(data.perEndpoint) && data.perEndpoint.length) {
      const table = $("<table>").addClass("stats-table");
      const thead = $("<thead>").append($("<tr>").append($("<th>").text("Method"), $("<th>").text("Endpoint"), $("<th>").text("Requests")));
      table.append(thead);
      const tbody = $("<tbody>");
      for (const row of data.perEndpoint) {
        tbody.append($("<tr>").append($("<td>").text(row.method), $("<td>").text(row.endpoint), $("<td>").text(row.count)));
      }
      table.append(tbody);
      this.container.append(table);
    } else {
      this.container.append($(HTML.ELEMENTS.DIV).text("No per-endpoint data available."));
    }
  }
}
