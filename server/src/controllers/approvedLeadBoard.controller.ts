import {
  Request,
  Response,
} from "express";

import {
  addApprovedLeadToBoard,
  getApprovedLeadBoard,
  getApprovedLeadBoardItem,
  getAvailableApprovedLeads,
  updateApprovedLeadBoardItem,
  type ApprovedLeadBoardStatus,
} from "../services/approvedLeadBoard.service";


const allowedStatuses:
  ApprovedLeadBoardStatus[] =
[
  "pending",
  "planned",
  "assigned",
  "ongoing",
  "done",
];


/*
 * GET /api/lead-board/available
 */
export const listAvailableApprovedLeads =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const leads =
        await getAvailableApprovedLeads();


      return res.status(200).json({
        success: true,
        data: leads,
      });

    } catch (error) {
      console.error(
        "AVAILABLE APPROVED LEADS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load approved leads",
      });
    }
  };


/*
 * GET /api/lead-board
 */
export const listApprovedLeadBoard =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const board =
        await getApprovedLeadBoard();


      return res.status(200).json({
        success: true,
        data: board,
      });

    } catch (error) {
      console.error(
        "LEAD BOARD ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load Lead Board",
      });
    }
  };


/*
 * GET /api/lead-board/:id
 */
export const getSingleApprovedLeadBoardItem =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {
    try {
      const item =
        await getApprovedLeadBoardItem(
          req.params.id
        );


      return res.status(200).json({
        success: true,
        data: item,
      });

    } catch (error) {
      console.error(
        "GET BOARD ITEM ERROR:",
        error
      );


      return res.status(404).json({
        success: false,
        message:
          "Lead Board item not found",
      });
    }
  };


/*
 * POST /api/lead-board
 */
export const addApprovedLeadBoardItem =
  async (
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
        leadId,
        plannedStartDate,
        plannedEndDate,
      } =
        req.body ?? {};


      if (
        !leadId ||
        typeof leadId !==
          "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Approved lead is required",
        });
      }


      if (
        plannedStartDate &&
        plannedEndDate &&
        plannedEndDate <
          plannedStartDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Planned end date cannot be before the start date",
        });
      }


      const item =
        await addApprovedLeadToBoard({
          leadId,

          plannedStartDate:
            plannedStartDate ||
            null,

          plannedEndDate:
            plannedEndDate ||
            null,

          createdBy:
            req.user.id,
        });


      return res.status(201).json({
        success: true,

        message:
          "Approved lead added to Lead Board",

        data: item,
      });

    } catch (error) {
      console.error(
        "ADD BOARD ITEM ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to add approved lead",
      });
    }
  };


/*
 * PATCH /api/lead-board/:id
 */
export const editApprovedLeadBoardItem =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {
    try {
      const {
        name,
        description,
        status,
        plannedStartDate,
        plannedEndDate,
      } =
        req.body ?? {};


      if (
        name !== undefined &&
        (
          typeof name !==
            "string" ||
          !name.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Board item name cannot be empty",
        });
      }


      if (
        status !== undefined &&
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid Lead Board status",
        });
      }


      if (
        plannedStartDate &&
        plannedEndDate &&
        plannedEndDate <
          plannedStartDate
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Planned end date cannot be before the start date",
        });
      }


      const updated =
        await updateApprovedLeadBoardItem(
          req.params.id,
          {
            ...(name !==
              undefined && {
              name:
                name.trim(),
            }),

            ...(description !==
              undefined && {
              description:
                description?.trim() ||
                null,
            }),

            status,

            plannedStartDate,

            plannedEndDate,
          }
        );


      return res.status(200).json({
        success: true,

        message:
          "Approved lead updated successfully",

        data: updated,
      });

    } catch (error) {
      console.error(
        "EDIT BOARD ITEM ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update approved lead",
      });
    }
  };