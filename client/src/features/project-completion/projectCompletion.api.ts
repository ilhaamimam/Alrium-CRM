import {
  api,
} from "../../api/http";


/*
 * =========================================================
 * REVIEW FILTER STATUS
 * =========================================================
 */

export type ProjectCompletionStatus =
  | "not_submitted"
  | "pending_review"
  | "changes_requested"
  | "confirmed"
  | "all";


/*
 * =========================================================
 * PROJECT COMPLETION REVIEW
 * =========================================================
 */

export interface ProjectCompletionReview {
  id: string;

  project_id?: string;

  lead_id?: string;

  status?:
    | "pending"
    | "changes_required"
    | "confirmed"
    | string;

  completion_review_status?:
    | "pending"
    | "changes_required"
    | "confirmed"
    | string
    | null;

  review_notes?:
    string | null;

  completion_notes?:
    string | null;

  team_completed_at?:
    string | null;

  team_completed_by?:
    string | null;

  reviewed_at?:
    string | null;

  reviewed_by?:
    string | null;

  created_at?:
    string | null;

  updated_at?:
    string | null;


  /*
   * PROJECT
   */

  project?: {
    id?: string;

    title?: string;

    name?: string;

    status?: string;

    start_date?:
      string | null;

    end_date?:
      string | null;

    [key: string]:
      unknown;
  } | null;


  /*
   * LEAD
   */

  lead?: {
    id?: string;

    title?: string;

    name?: string;

    status?:
      string | null;

    company_name?:
      string | null;

    [key: string]:
      unknown;
  } | null;


  /*
   * TEAM
   */

  team?: {
    id?: string;

    name?: string;

    [key: string]:
      unknown;
  } | null;


  /*
   * ALLOW EXISTING BACKEND FIELDS
   */

  [key: string]:
    unknown;
}


/*
 * =========================================================
 * FETCH PROJECT COMPLETION REVIEWS
 *
 * pending
 * changes_required
 * confirmed
 * all
 *
 * For "all", no status parameter is sent.
 * =========================================================
 */

export const fetchProjectCompletionReviews =
  async (
    status:
      ProjectCompletionStatus
  ) => {

    const response =
      status === "all"
        ? await api.get(
            "/project-completion/reviews"
          )
        : await api.get(
            "/project-completion/reviews",
            {
              params: {
                status,
              },
            }
          );


    return (
      response.data?.data ??
      []
    );
  };


/*
 * =========================================================
 * FETCH ONE REVIEW
 *
 * Newer name.
 * =========================================================
 */

export const fetchProjectCompletionReviewById =
  async (
    reviewId: string
  ): Promise<any> => {

    const response =
      await api.get(
        `/project-completion/reviews/${reviewId}`
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * FETCH ONE REVIEW
 *
 * Backwards-compatible name used by:
 *
 * ProjectCompletionReviewDetailsPage.tsx
 * =========================================================
 */

export const fetchCompletionReviewById =
  async (
    reviewId: string
  ): Promise<any> => {

    return (
      await fetchProjectCompletionReviewById(
        reviewId
      )
    );
  };


/*
 * =========================================================
 * GENERIC REVIEW UPDATE
 * =========================================================
 */

export const updateProjectCompletionReview =
  async (
    reviewId: string,

    input: {
      status?:
        | "pending"
        | "changes_required"
        | "confirmed";

      notes?: string;

      reviewNotes?: string;

      [key: string]:
        unknown;
    }
  ): Promise<any> => {

    const response =
      await api.patch(
        `/project-completion/reviews/${reviewId}`,
        input
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * REQUEST PROJECT CHANGES
 *
 * Used by:
 *
 * ProjectCompletionReviewDetailsPage.tsx
 * =========================================================
 */

export const requestProjectCompletionChanges =
  async (
    reviewId: string,

    notes:
      string = ""
  ): Promise<any> => {

    const response =
      await api.post(
        `/project-completion/reviews/${reviewId}/request-changes`,
        {
          notes:
            notes.trim(),
        }
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * CONFIRM PROJECT COMPLETION
 *
 * Used by:
 *
 * ProjectCompletionReviewDetailsPage.tsx
 * =========================================================
 */

export const confirmProjectCompletion =
  async (
    reviewId: string,

    notes:
      string = ""
  ): Promise<any> => {

    const response =
      await api.post(
        `/project-completion/reviews/${reviewId}/confirm`,
        {
          notes:
            notes.trim(),
        }
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * FETCH PROJECT COMPLETION STATUS
 *
 * Used by:
 *
 * TeamCompletionSubmitForm.tsx
 *
 * Return type is intentionally flexible because the
 * existing component already has its own status interface.
 * =========================================================
 */

export const fetchProjectCompletionStatus =
  async (
    projectId: string
  ): Promise<any> => {

    const response =
      await api.get(
        `/project-completion/projects/${projectId}/status`
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * TEAM MEMBER SUBMITS COMPLETION
 *
 * Supports:
 *
 * submitProjectCompletion(
 *   projectId,
 *   notes.trim()
 * )
 *
 * and:
 *
 * submitProjectCompletion(
 *   projectId,
 *   {
 *     notes: "Finished"
 *   }
 * )
 * =========================================================
 */

export const submitProjectCompletion =
  async (
    projectId: string,

    input?:
      | string
      | {
          notes?: string;

          completionNotes?: string;

          [key: string]:
            unknown;
        }
  ): Promise<any> => {

    const payload =
      typeof input ===
      "string"
        ? {
            notes:
              input.trim(),
          }
        : input ??
          {};


    const response =
      await api.post(
        `/project-completion/projects/${projectId}/submit`,
        payload
      );


    return (
      response.data?.data ??
      response.data
    );
  };


/*
 * =========================================================
 * FINAL PROJECT UPDATES
 *
 * Used by:
 *
 * FinalProjectUpdatesPage.tsx
 * =========================================================
 */

export const fetchFinalProjectUpdates =
  async (): Promise<any[]> => {

    const response =
      await api.get(
        "/project-completion/final-updates"
      );


    const data =
      response.data?.data ??
      response.data ??
      [];


    /*
     * Always return an array to the page.
     */

    return Array.isArray(
      data
    )
      ? data
      : [];
  };