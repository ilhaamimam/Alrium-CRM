import { api } from "../../api/http";

import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "./contact.types";


export const fetchContacts =
  async (): Promise<Contact[]> => {

    const response =
      await api.get(
        "/contacts"
      );

    return response.data.data;
  };


export const fetchContactById =
  async (
    id: string
  ): Promise<Contact> => {

    const response =
      await api.get(
        `/contacts/${id}`
      );

    return response.data.data;
  };


export const createContact =
  async (
    input: CreateContactInput
  ): Promise<Contact> => {

    const response =
      await api.post(
        "/contacts",
        input
      );

    return response.data.data;
  };


export const updateContact =
  async (
    id: string,
    input: UpdateContactInput
  ): Promise<Contact> => {

    const response =
      await api.patch(
        `/contacts/${id}`,
        input
      );

    return response.data.data;
  };