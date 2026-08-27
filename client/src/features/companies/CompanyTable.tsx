import {
  Link,
} from "react-router-dom";

import type {
  Company,
} from "./company.types";


interface Props {
  companies: Company[];
}


export default function CompanyTable({
  companies,
}: Props) {
  if (companies.length === 0) {
    return (
      <p>No companies found.</p>
    );
  }


  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>

          <th>Industry</th>

          <th>Website</th>

          <th>Phone</th>

          <th>Actions</th>
        </tr>
      </thead>


      <tbody>
        {companies.map(
          (company) => (
            <tr key={company.id}>

              <td>
                {company.name}
              </td>

              <td>
                {company.industry ||
                  "-"}
              </td>

              <td>
                {company.website ? (
                    <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    >
                    {company.website}
                    </a>
                ) : (
                    "-"
                )}
                </td>

              <td>
                {company.phone ||
                  "-"}
              </td>

              <td>
            <Link
                to={
                `/companies/${company.id}`
                }
            >
                {company.name}
            </Link>
            </td>

            </tr>
          )
        )}
      </tbody>
    </table>
  );
}