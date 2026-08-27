import { api } from "../../api/http";

import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.types";


export const fetchCompanies =
  async (): Promise<Company[]> => {
    const response =
      await api.get("/companies");

    return response.data.data;
  };


export const fetchCompanyById =
  async (
    companyId: string
  ): Promise<Company> => {
    const response =
      await api.get(
        `/companies/${companyId}`
      );

    return response.data.data;
  };


export const createCompany =
  async (
    input: CreateCompanyInput
  ): Promise<Company> => {
    const response =
      await api.post(
        "/companies",
        input
      );

    return response.data.data;
  };


export const updateCompany =
  async (
    companyId: string,
    input: UpdateCompanyInput
  ): Promise<Company> => {
    const response =
      await api.patch(
        `/companies/${companyId}`,
        input
      );

    return response.data.data;
  };