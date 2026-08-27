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

export const listContacts = async (
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
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load contacts",
    });
  }
};
export const getSingleContact = async (
  req: Request<{ id: string }>,
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
    console.error(error);

    return res.status(404).json({
      success: false,
      message:
        "Contact not found",
    });
  }
};

export const addContact = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
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
    } = req.body ?? {};


    if (
      !firstName ||
      typeof firstName !== "string" ||
      !firstName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name is required",
      });
    }


    const contact =
      await createContact({
        companyId:
          companyId || null,

        firstName:
          firstName.trim(),

        lastName,
        email,
        phone,
        jobTitle,
        notes,

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
      "CREATE CONTACT ERROR:",
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

export const editContact = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const contact =
      await updateContact(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to update contact",
    });
  }
};

