import {
  Request,
  Response,
} from "express";

import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "../services/company.service";

export const listCompanies = async (
  req: Request,
  res: Response
) => {
  try {
    const companies =
      await getCompanies();

    return res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load companies",
    });
  }
};

export const getSingleCompany = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const company =
      await getCompanyById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error(
      "GET SINGLE COMPANY ERROR:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Company not found",
    });
  }
};

export const addCompany = async (
  req: Request,
  res: Response
) => {
  try {
    console.log(
      "COMPANY REQUEST BODY:",
      req.body
    );

    console.log(
      "COMPANY REQUEST USER:",
      req.user
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      name,
      industry,
      website,
      phone,
      address,
      notes,
    } = req.body ?? {};

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name is required",
      });
    }

    const company =
      await createCompany({
        name: name.trim(),
        industry,
        website,
        phone,
        address,
        notes,
        createdBy: req.user.id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error(
      "CREATE COMPANY CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create company",
    });
  }
};

export const editCompany = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const {
      name,
      industry,
      website,
      phone,
      address,
      notes,
    } = req.body ?? {};


    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name cannot be empty",
      });
    }


    const company =
      await updateCompany(
        req.params.id,
        {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(industry !== undefined && {
            industry:
              industry.trim() || null,
          }),

          ...(website !== undefined && {
            website:
              website.trim() || null,
          }),

          ...(phone !== undefined && {
            phone:
              phone.trim() || null,
          }),

          ...(address !== undefined && {
            address:
              address.trim() || null,
          }),

          ...(notes !== undefined && {
            notes:
              notes.trim() || null,
          }),
        }
      );


    return res.status(200).json({
      success: true,
      message:
        "Company updated successfully",
      data: company,
    });

  } catch (error) {
    console.error(
      "UPDATE COMPANY CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update company",
    });
  }
};