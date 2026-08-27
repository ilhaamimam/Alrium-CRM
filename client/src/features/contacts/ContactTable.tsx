import {
  Link,
} from "react-router-dom";

import type {
  Contact,
} from "./contact.types";


interface Props {
  contacts: Contact[];
}


export default function ContactTable({
  contacts,
}: Props) {
  if (contacts.length === 0) {
    return (
      <p>No contacts found.</p>
    );
  }


  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>

          <th>Company</th>

          <th>Email</th>

          <th>Phone</th>

          <th>Job Title</th>

          <th>Actions</th>
        </tr>
      </thead>


      <tbody>
        {contacts.map(
          (contact) => (
            <tr key={contact.id}>

              <td>
                <Link
                  to={
                    `/contacts/${contact.id}`
                  }
                >
                  {contact.first_name}
                  {" "}
                  {contact.last_name || ""}
                </Link>
              </td>


              <td>
                {contact.companies?.name ||
                  "-"}
              </td>


              <td>
                {contact.email || "-"}
              </td>


              <td>
                {contact.phone || "-"}
              </td>


              <td>
                {contact.job_title ||
                  "-"}
              </td>


              <td>
                <Link
                  to={
                    `/contacts/${contact.id}`
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