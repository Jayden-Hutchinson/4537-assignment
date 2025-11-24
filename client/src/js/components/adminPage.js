import { HTML, SERVER_BASE_URL } from "../constants.js";

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

    endpointsSection.append(endpointsTable);
    this.element.append(endpointsSection);

    // Try to fetch data from server using the stored access token
    let endpointsData = null;
    let usersData = null;
    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/admin/stats`, { method: "GET", headers });
      if (res.ok) {
        endpointsData = await res.json();
      } else {
        console.error("Failed to fetch /api/admin/stats:", res.status, await res.text());
      }
    } catch (e) {
      console.error("Error fetching /api/admin/stats:", e);
    }

    if (!endpointsData) {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/admin/stats`, { method: "GET", headers });
        if (res.ok) endpointsData = await res.json();
        else console.error("Fallback /admin/stats returned:", res.status);
      } catch (e) {
        console.error("Fallback error fetching /admin/stats:", e);
      }
    }


    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/admin/user-usage`, { method: "GET", headers });
      if (res.ok) {
        usersData = await res.json();
      }
    } catch (e) {
      console.error("Error fetching user-usage for totals:", e);
    }

    // If no endpoints data, show placeholder sample data
    if (!endpointsData) {
      endpointsData = [
        { method: "PUT", endpoint: "/API/v1/customers/id", requests: 79 },
        { method: "GET", endpoint: "/API/v1/customers/id", requests: 145 },
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

    // (User list rendering moved to Manage Users section to avoid duplication)

    // Management section: fetch full users list and render management table with actions
    try {
      const usersRes = await fetch(`${SERVER_BASE_URL}/api/admin/users`, { method: "GET", headers });
      if (usersRes.ok) {
        const usersList = await usersRes.json();
        const manageSection = $(HTML.ELEMENTS.DIV).addClass("manage-users");
        manageSection.append($(HTML.ELEMENTS.H2).text("Manage Users"));
        const manageTable = $("<table>").addClass("manage-table");
        manageTable.append(
          $("<thead>").append($("<tr>").append($("<th>").text("Email"), $("<th>").text("Role"), $("<th>").text("Total Requests"), $("<th>").text("Actions")))
        );
        const mtbody = $("<tbody>");

        // map of totals by email
        const totals = (usersData || []).reduce((acc, it) => { acc[it.email] = it.totalRequests; return acc; }, {});

        for (const u of usersList) {
          const email = u.email;
          const tr = $("<tr>").append(
            $("<td>").text(email),
            $("<td>").text(u.role || "user"),
            $("<td>").text(totals[email] || 0)
          );

          const deleteBtn = $("<button>").text("Delete").addClass("admin-delete").attr("data-email", email);
          const updateBtn = $("<button>").text("Update").addClass("admin-update").attr("data-email", email);
          const actionsTd = $("<td>").append(deleteBtn, updateBtn);
          tr.append(actionsTd);
          mtbody.append(tr);
        }

        manageTable.append(mtbody);
        manageSection.append(manageTable);
        this.element.append(manageSection);

        // Attach handlers
        this.element.find(".admin-delete").on("click", async (e) => {
          const target = $(e.currentTarget);
          const email = target.attr("data-email");
          if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
          try {
            const delRes = await fetch(`${SERVER_BASE_URL}/api/admin/user/${encodeURIComponent(email)}`, { method: "DELETE", headers });
            if (delRes.ok) {
              alert(`Deleted ${email}`);
              target.closest("tr").remove();
            } else {
              const t = await delRes.text();
              alert(`Failed to delete: ${delRes.status} ${t}`);
            }
          } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete user");
          }
        });

        this.element.find(".admin-update").on("click", async (e) => {
          const target = $(e.currentTarget);
          const email = target.attr("data-email");
          const newEmail = prompt("Enter new email (leave blank to keep):", email) || null;
          const newPassword = prompt("Enter new password (leave blank to keep):", "") || null;
          const body = {};
          if (newEmail && newEmail !== email) body.email = newEmail;
          if (newPassword) body.password = newPassword;
          if (Object.keys(body).length === 0) return;
          try {
            const patchRes = await fetch(`${SERVER_BASE_URL}/api/admin/user/${encodeURIComponent(email)}`, { method: "PATCH", headers, body: JSON.stringify(body) });
            if (patchRes.ok) {
              alert(`Updated ${email}`);
              // simple refresh: reload page state
              location.reload();
            } else {
              const t = await patchRes.text();
              alert(`Failed to update: ${patchRes.status} ${t}`);
            }
          } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update user");
          }
        });
      }
    } catch (e) {
      console.error("Failed to load management users:", e);
    }
  }
}
