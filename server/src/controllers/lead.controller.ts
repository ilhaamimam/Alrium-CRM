import {
  Request,
  Response,
} from "express";

import {
  archiveLead,
  createLead,
  getLeadById,
  getLeads,
  updateLead,
} from "../services/lead.service";

export const listLeads = async (
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


    const leads =
      await getLeads(
        req.user.id,
        req.user.role || ""
      );


    return res.status(200).json({
      success: true,
      data: leads,
    });

  } catch (error) {
    console.error(
      "LIST LEADS ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load leads",
    });
  }
};

export const getSingleLead = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const lead =
      await getLeadById(
        req.params.id
      );


    return res.status(200).json({
      success: true,
      data: lead,
    });

  } catch (error) {
    console.error(
      "GET SINGLE LEAD ERROR:",
      error
    );


    return res.status(404).json({
      success: false,
      message:
        "Lead not found",
    });
  }
};

export const addLead = async (
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
      contactId,
      title,
      description,
      source,
      estimatedBudget,
      expectedCloseDate,
      assignedSalesRepId,
    } = req.body ?? {};


    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lead title is required",
      });
    }


    const budget =
      estimatedBudget === "" ||
      estimatedBudget === undefined ||
      estimatedBudget === null
        ? null
        : Number(estimatedBudget);


    if (
      budget !== null &&
      (
        Number.isNaN(budget) ||
        budget < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Estimated budget must be a valid positive number",
      });
    }


    const lead =
      await createLead({
        companyId:
          companyId || null,

        contactId:
          contactId || null,

        title:
          title.trim(),

        description,

        source,

        estimatedBudget:
          budget,

        expectedCloseDate:
          expectedCloseDate || null,

        assignedSalesRepId:
          assignedSalesRepId || null,

        createdBy:
          req.user.id,
      });


    return res.status(201).json({
      success: true,
      message:
        "Lead created successfully",
      data: lead,
    });

  } catch (error) {
    console.error(
      "CREATE LEAD ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create lead",
    });
  }
};

export const editLead = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const {
      companyId,
      contactId,
      title,
      description,
      source,
      estimatedBudget,
      expectedCloseDate,
      assignedSalesRepId,
    } = req.body ?? {};


    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        !title.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lead title cannot be empty",
      });
    }


    let budget:
      number | null | undefined =
      undefined;


    if (
      estimatedBudget !== undefined
    ) {
      if (
        estimatedBudget === "" ||
        estimatedBudget === null
      ) {
        budget = null;
      } else {
        budget =
          Number(estimatedBudget);


        if (
          Number.isNaN(budget) ||
          budget < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Estimated budget must be valid",
          });
        }
      }
    }


    const lead =
      await updateLead(
        req.params.id,
        {
          companyId,
          contactId,

          ...(title !== undefined && {
            title:
              title.trim(),
          }),

          description,
          source,

          estimatedBudget:
            budget,

          expectedCloseDate,

          assignedSalesRepId,
        }
      );


    return res.status(200).json({
      success: true,
      message:
        "Lead updated successfully",
      data: lead,
    });

  } catch (error) {
    console.error(
      "UPDATE LEAD ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update lead",
    });
  }
};

export const removeLead = async (
  req: Request<{ id: string }>,
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


    await archiveLead(
      req.params.id,
      req.user.id
    );


    return res.status(200).json({
      success: true,
      message:
        "Lead removed successfully",
    });

  } catch (error) {
    console.error(
      "REMOVE LEAD ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to remove lead",
    });
  }
};

