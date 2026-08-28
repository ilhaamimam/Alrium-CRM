import { api } from "../../api/http";

import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "./contact.types";

export const fetchContacts =
  async (): Promise<Contact[]> => {
    const response =
      await api.get("/contacts");

    return response.data.data;
  };

export const fetchContactById =
  async (
    contactId: string
  ): Promise<Contact> => {
    const response =
      await api.get(
        `/contacts/${contactId}`
      );

    return response.data.data;
  };

export const createContact =
  async (
    input: CreateContactInput
  ): Promise<Contact> => {
    console.log(
      "CONTACT API INPUT:",
      input
    );

    const response =
      await api.post(
        "/contacts",
        input
      );

    return response.data.data;
  };

export const updateContact =
  async (
    contactId: string,
    input: UpdateContactInput
  ): Promise<Contact> => {
    const response =
      await api.patch(
        `/contacts/${contactId}`,
        input
      );

    return response.data.data;
  };