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
  if (
    companies.length === 0
  ) {
    return (
      <div className="empty-state">
        No companies found.
      </div>
    );
  }


  return (
    <div className="table-wrap">

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
                  <Link
                    className="company-name-link"
                    to={
                      `/companies/${company.id}`
                    }
                  >
                    {company.name}
                  </Link>
                </td>


                <td>
                  {company.industry ||
                    "-"}
                </td>


                <td>
                  {company.website ? (
                    <a
                      href={
                        company.website
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit
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
                    className="btn btn-secondary"
                    to={
                      `/companies/${company.id}`
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