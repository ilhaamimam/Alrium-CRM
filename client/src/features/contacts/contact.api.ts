import {
  api,
} from "../../api/http";

import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "./contact.types";


/*
 * =========================================================
 * GET ALL
 * =========================================================
 */

export const fetchContacts =
  async (): Promise<Contact[]> => {

    const response =
      await api.get(
        "/contacts"
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * GET ONE
 * =========================================================
 */

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


/*
 * =========================================================
 * CREATE
 * =========================================================
 */

export const createContact =
  async (
    input:
      CreateContactInput
  ): Promise<Contact> => {

    const payload = {

      companyId:
        input.companyId ||
        null,

      firstName:
        input.firstName,

      lastName:
        input.lastName ||
        "",

      email:
        input.email ||
        "",

      phone:
        input.phone ||
        "",

      jobTitle:
        input.jobTitle ||
        "",

      notes:
        input.notes ||
        "",
    };


    console.log(
      "CONTACT API PAYLOAD:",
      payload
    );


    /*
     * Axios:
     *
     * post(
     *   URL,
     *   BODY,
     *   CONFIG
     * )
     *
     * payload MUST be second argument.
     */

    const response =
      await api.post(
        "/contacts",

        payload,

        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );


    return response.data.data;
  };


/*
 * =========================================================
 * UPDATE
 * =========================================================
 */

export const updateContact =
  async (
    id: string,
    input:
      UpdateContactInput
  ): Promise<Contact> => {

    const payload = {

      companyId:
        input.companyId ??
        null,

      firstName:
        input.firstName,

      lastName:
        input.lastName,

      email:
        input.email,

      phone:
        input.phone,

      jobTitle:
        input.jobTitle,

      notes:
        input.notes,
    };


    const response =
      await api.patch(
        `/contacts/${id}`,

        payload,

        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );


    return response.data.data;
  };


/*
 * =========================================================
 * DELETE
 * =========================================================
 */

export const deleteContact =
  async (
    id: string
  ): Promise<void> => {

    await api.delete(
      `/contacts/${id}`
    );
  };