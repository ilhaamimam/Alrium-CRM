import axios from "axios";

import {
  supabase,
} from "../lib/supabase";


const baseURL =
  import.meta.env
    .VITE_API_URL ||
  "http://localhost:4000/api";


console.log(
  "CRM API BASE URL:",
  baseURL
);


export const api =
  axios.create({
    baseURL,

    headers: {
      Accept:
        "application/json",

      "Content-Type":
        "application/json",
    },
  });


/*
 * =========================================================
 * AUTH TOKEN
 * =========================================================
 */

api.interceptors.request.use(
  async (
    config
  ) => {

    const {
      data: {
        session,
      },
    } =
      await supabase.auth
        .getSession();


    if (
      session?.access_token
    ) {
      config.headers.Authorization =
        `Bearer ${session.access_token}`;
    }


    /*
     * IMPORTANT
     *
     * We must return the same config.
     */
    return config;
  },


  (
    error
  ) => {
    return Promise.reject(
      error
    );
  }
);