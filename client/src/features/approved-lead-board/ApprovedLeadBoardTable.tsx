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
      <div className="empty-state">
        No approved leads on the board.
      </div>
    );
  }


  return (
    <div className="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Lead</th>

            <th>Company</th>

            <th>Contact</th>

            <th>Budget</th>

            <th>Status</th>

            <th>Start</th>

            <th>End</th>

            <th>Actions</th>
          </tr>
        </thead>


        <tbody>

          {items.map(
            (item) => (
              <tr key={item.id}>

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
                  <span
                    className={
                      `board-status status-${item.status}`
                    }
                  >
                    {item.status}
                  </span>
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
                    className="btn btn-secondary"
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

    </div>
  );
}