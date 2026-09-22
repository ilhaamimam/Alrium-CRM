import type {
  Request,
  Response,
} from "express";

import {
  getPipelineLeads,
  getPipelineTeamMembers,
  getPipelineTeams,
  getProductionReadyPipelineLeads,
} from "../services/pipeline.service";


export const listPipelineLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const data =
        await getPipelineLeads();


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load leads",
        });
    }
  };


export const listProductionReadyLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const data =
        await getProductionReadyPipelineLeads();


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load approved leads",
        });
    }
  };


export const listPipelineTeams =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const data =
        await getPipelineTeams();


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load teams",
        });
    }
  };


export const listPipelineTeamMembers =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const data =
        await getPipelineTeamMembers();


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load team members",
        });
    }
  };