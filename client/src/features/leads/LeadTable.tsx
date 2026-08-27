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
  if (leads.length === 0) {
    return (
      <p>No leads found.</p>
    );
  }


  return (
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
                  to={
                    `/leads/${lead.id}`
                  }
                >
                  {lead.title}
                </Link>
              </td>


              <td>
                {lead.companies?.name ||
                  "-"}
              </td>


              <td>
                {lead.contacts
                  ? `${lead.contacts.first_name} ${lead.contacts.last_name || ""}`
                  : "-"}
              </td>


              <td>
                {lead.estimated_budget !==
                null
                  ? lead.estimated_budget
                  : "-"}
              </td>


              <td>
                {lead.temperature}
              </td>


              <td>
                {lead.workflow_stage}
              </td>


              <td>
                <Link
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
  );
}