import { HTML, PROXY_BASE } from "../constants.js";

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

    try {
      const res = await fetch(`/api/user/usage`, { method: "GET", headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      this.render(json);
    } catch (err) {
      try {
        const proxyRes = await fetch(`${PROXY_BASE}/user/usage`, { method: "GET", headers });
        if (!proxyRes.ok) throw new Error(`Status ${proxyRes.status}`);
        const json = await proxyRes.json();
        this.render(json);
        return;
      } catch (e) {
        this.container.html("<p>Unable to load usage data from server.</p>");
      }
    }
  }

  render(data) {
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
