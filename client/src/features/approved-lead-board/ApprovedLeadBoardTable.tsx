import {
  Link,
} from "react-router-dom";

import type {
  ApprovedLeadBoardItem,
} from "./approvedLeadBoard.types";


interface Props {
  items:
    ApprovedLeadBoardItem[];
}


export default function ApprovedLeadBoardTable({
  items,
}: Props) {

  if (
    items.length === 0
  ) {
    return (
      <p>
        No approved leads on the board.
      </p>
    );
  }


  return (
    <table>

      <thead>
        <tr>
          <th>
            Lead
          </th>

          <th>
            Company
          </th>

          <th>
            Contact
          </th>

          <th>
            Budget
          </th>

          <th>
            Status
          </th>

          <th>
            Planned Start
          </th>

          <th>
            Planned End
          </th>

          <th>
            Actions
          </th>
        </tr>
      </thead>


      <tbody>

        {items.map(
          (item) => (
            <tr
              key={
                item.id
              }
            >

              <td>
                {item.name}
              </td>


              <td>
                {item.leads
                  ?.companies
                  ?.name ||
                  "-"}
              </td>


              <td>
                {item.leads
                  ?.contacts
                  ? `${item.leads.contacts.first_name} ${item.leads.contacts.last_name || ""}`
                  : "-"}
              </td>


              <td>
                {item.leads
                  ?.estimated_budget ??
                  "-"}
              </td>


              <td>
                {item.status}
              </td>


              <td>
                {item.planned_start_date ||
                  "-"}
              </td>


              <td>
                {item.planned_end_date ||
                  "-"}
              </td>


              <td>
                <Link
                  to={
                    `/lead-board/${item.id}`
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