import {
  Request,
  Response,
} from "express";

import {
  createContact,
  getContactById,
  getContacts,
  updateContact,
} from "../services/contact.service";


/*
 * GET /api/contacts
 */
export const listContacts =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const contacts =
        await getContacts();

      return res.status(200).json({
        success: true,
        data: contacts,
      });

    } catch (error) {
      console.error(
        "LIST CONTACTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load contacts",
      });
    }
  };


/*
 * GET /api/contacts/:id
 */
export const getSingleContact =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {
    try {
      const contact =
        await getContactById(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: contact,
      });

    } catch (error) {
      console.error(
        "GET SINGLE CONTACT ERROR:",
        error
      );

      return res.status(404).json({
        success: false,
        message:
          "Contact not found",
      });
    }
  };


/*
 * POST /api/contacts
 */
export const addContact =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      console.log(
        "CONTACT REQUEST BODY:",
        req.body
      );

      console.log(
        "CONTACT REQUEST USER:",
        req.user
      );


      /*
       * Ensure logged-in CRM user exists.
       */
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }


      /*
       * React sends camelCase names.
       */
      const {
        companyId,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        notes,
      } =
        req.body ?? {};


      console.log(
        "FIRST NAME RECEIVED:",
        firstName
      );


      /*
       * Validate first name.
       */
      if (
        typeof firstName !==
          "string" ||
        !firstName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name is required",
        });
      }


      /*
       * Create contact.
       */
      const contact =
        await createContact({
          companyId:
            companyId || null,

          firstName:
            firstName.trim(),

          lastName:
            typeof lastName ===
            "string"
              ? lastName.trim()
              : "",

          email:
            typeof email ===
            "string"
              ? email.trim()
              : "",

          phone:
            typeof phone ===
            "string"
              ? phone.trim()
              : "",

          jobTitle:
            typeof jobTitle ===
            "string"
              ? jobTitle.trim()
              : "",

          notes:
            typeof notes ===
            "string"
              ? notes.trim()
              : "",

          createdBy:
            req.user.id,
        });


      return res.status(201).json({
        success: true,

        message:
          "Contact created successfully",

        data: contact,
      });

    } catch (error) {
      console.error(
        "CREATE CONTACT CONTROLLER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to create contact",
      });
    }
  };


/*
 * PATCH /api/contacts/:id
 */
export const editContact =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {
    try {
      const {
        companyId,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        notes,
      } =
        req.body ?? {};


      if (
        firstName !==
          undefined &&
        (
          typeof firstName !==
            "string" ||
          !firstName.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name cannot be empty",
        });
      }


      const contact =
        await updateContact(
          req.params.id,
          {
            companyId,

            ...(firstName !==
              undefined && {
              firstName:
                firstName.trim(),
            }),

            lastName,

            email,

            phone,

            jobTitle,

            notes,
          }
        );


      return res.status(200).json({
        success: true,

        message:
          "Contact updated successfully",

        data: contact,
      });

    } catch (error) {
      console.error(
        "UPDATE CONTACT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update contact",
      });
    }
  };