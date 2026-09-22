import type {
  Request,
  Response,
} from "express";

import {
  createContactRecord,
  deleteContactRecord,
  getAllContacts,
  getContactRecordById,
  updateContactRecord,
} from "../services/contact.service";


/*
 * =========================================================
 * GET ALL
 * =========================================================
 */

export const getContactsHandler =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const contacts =
        await getAllContacts();


      return res
        .status(200)
        .json({
          success: true,

          data:
            contacts,
        });

    } catch (error) {

      console.error(
        "GET CONTACTS CONTROLLER ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load contacts",
        });
    }
  };


/*
 * =========================================================
 * GET ONE
 * =========================================================
 */

export const getContactHandler =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      const contact =
        await getContactRecordById(
          req.params.id
        );


      return res
        .status(200)
        .json({
          success: true,

          data:
            contact,
        });

    } catch (error) {

      return res
        .status(404)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Contact not found",
        });
    }
  };


/*
 * =========================================================
 * CREATE
 * =========================================================
 */

export const createContactHandler =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      console.log(
        "CONTACT REQUEST USER:",
        req.user
      );


      console.log(
        "CONTACT REQUEST BODY:",
        req.body
      );


      if (
        !req.body ||
        typeof req.body !==
          "object"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Contact request body is missing",
          });
      }


      const {
        companyId,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        notes,
      } =
        req.body;


      console.log(
        "FIRST NAME RECEIVED:",
        firstName
      );


      if (
        typeof firstName !==
          "string" ||
        !firstName.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "First name is required",
          });
      }


      const contact =
        await createContactRecord({
          companyId:
            cleanOptionalString(
              companyId
            ),

          firstName:
            firstName.trim(),

          lastName:
            cleanOptionalString(
              lastName
            ),

          email:
            cleanOptionalString(
              email
            ),

          phone:
            cleanOptionalString(
              phone
            ),

          jobTitle:
            cleanOptionalString(
              jobTitle
            ),

          notes:
            cleanOptionalString(
              notes
            ),

          createdBy:
            req.user.id,
        });


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Contact created successfully",

          data:
            contact,
        });

    } catch (error) {

      console.error(
        "CREATE CONTACT CONTROLLER ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to create contact",
        });
    }
  };


/*
 * =========================================================
 * UPDATE
 * =========================================================
 */

export const updateContactHandler =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.body ||
        typeof req.body !==
          "object"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Contact request body is missing",
          });
      }


      const {
        companyId,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        notes,
      } =
        req.body;


      /*
       * If firstName is included in update,
       * it cannot be blank.
       */

      if (
        firstName !==
          undefined &&
        (
          typeof firstName !==
            "string" ||
          !firstName.trim()
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "First name is required",
          });
      }


      const contact =
        await updateContactRecord(
          req.params.id,
          {
            companyId:
              companyId ===
                undefined
                ? undefined
                : cleanOptionalString(
                    companyId
                  ),

            firstName:
              firstName ===
                undefined
                ? undefined
                : firstName.trim(),

            lastName:
              lastName ===
                undefined
                ? undefined
                : cleanOptionalString(
                    lastName
                  ),

            email:
              email ===
                undefined
                ? undefined
                : cleanOptionalString(
                    email
                  ),

            phone:
              phone ===
                undefined
                ? undefined
                : cleanOptionalString(
                    phone
                  ),

            jobTitle:
              jobTitle ===
                undefined
                ? undefined
                : cleanOptionalString(
                    jobTitle
                  ),

            notes:
              notes ===
                undefined
                ? undefined
                : cleanOptionalString(
                    notes
                  ),
          }
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Contact updated successfully",

          data:
            contact,
        });

    } catch (error) {

      console.error(
        "UPDATE CONTACT CONTROLLER ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to update contact",
        });
    }
  };


/*
 * =========================================================
 * DELETE
 * =========================================================
 */

export const deleteContactHandler =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      await deleteContactRecord(
        req.params.id
      );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Contact deleted successfully",
        });

    } catch (error) {

      console.error(
        "DELETE CONTACT CONTROLLER ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to delete contact",
        });
    }
  };


/*
 * =========================================================
 * HELPER
 * =========================================================
 */

function cleanOptionalString(
  value: unknown
): string | null {

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const cleaned =
    value.trim();


  return cleaned
    ? cleaned
    : null;
}