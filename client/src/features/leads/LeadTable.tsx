import {
  Link,
} from "react-router-dom";

import type {
  Lead,
} from "./lead.types";


interface Props {
  leads: Lead[];
}


export default function LeadTable({
  leads,
}: Props) {
  if (
    leads.length === 0
  ) {
    return (
      <div className="empty-state">
        No leads found.
      </div>
    );
  }


  return (
    <div className="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Title</th>

            <th>Company</th>

            <th>Contact</th>

            <th>Budget</th>

            <th>Temperature</th>

            <th>Status</th>

            <th>Actions</th>
          </tr>
        </thead>


        <tbody>

          {leads.map(
            (lead) => (
              <tr key={lead.id}>

                <td>
                  <Link
                    className="lead-title-link"
                    to={
                      `/leads/${lead.id}`
                    }
                  >
                    {lead.title}
                  </Link>
                </td>


                <td>
                  {lead.companies
                    ?.name ||
                    "-"}
                </td>


                <td>
                  {lead.contacts
                    ? `${lead.contacts.first_name} ${lead.contacts.last_name || ""}`
                    : "-"}
                </td>


                <td>
                  {lead.estimated_budget ??
                    "-"}
                </td>


                <td>
                  <span
                    className={
                      lead.temperature ===
                      "hot"
                        ? "badge badge-danger"
                        : "badge badge-primary"
                    }
                  >
                    {lead.temperature ===
                    "hot"
                      ? "Hot"
                      : "Cold"}
                  </span>
                </td>


                <td>
                  <span className="badge">
                    {lead.workflow_stage}
                  </span>
                </td>


                <td>
                  <Link
                    className="btn btn-secondary"
                    to={
                      `/leads/${lead.id}`
                    }
                  >
                    View
                  </Link>
                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}