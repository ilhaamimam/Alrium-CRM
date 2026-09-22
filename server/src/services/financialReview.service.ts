import {
  supabaseAdmin,
} from "../config/supabase";


export type FinancialDecision =
  | "pending"
  | "approved"
  | "rejected";


interface ReviewDecisionInput {
  leadId: string;

  decision:
    "approved" |
    "rejected";

  notes:
    string | null;

  reviewedBy:
    string;
}


/*
 * =========================================================
 * GET ALL LEADS + FINANCIAL STATUS
 * =========================================================
 */

export const getFinancialReviewLeads =
  async () => {

    /*
     * -----------------------------------------
     * LOAD LEADS
     * -----------------------------------------
     */

    const {
      data: leads,
      error: leadsError,
    } =
      await supabaseAdmin
        .from("leads")
        .select(`
          *,
          companies (
            id,
            name
          ),
          contacts (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (leadsError) {

      console.error(
        "FINANCIAL LEADS ERROR:",
        leadsError
      );


      throw new Error(
        leadsError.message
      );
    }


    /*
     * -----------------------------------------
     * LOAD EXISTING FINANCIAL REVIEWS
     * -----------------------------------------
     */

    const {
      data: reviews,
      error: reviewsError,
    } =
      await supabaseAdmin
        .from(
          "financial_reviews"
        )
        .select(`
          id,
          lead_id,
          decision,
          review_notes,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        `);


    if (reviewsError) {

      console.error(
        "FINANCIAL REVIEWS ERROR:",
        reviewsError
      );


      throw new Error(
        reviewsError.message
      );
    }


    /*
     * -----------------------------------------
     * REVIEW LOOKUP
     * -----------------------------------------
     */

    const reviewMap =
      new Map(
        (
          reviews ??
          []
        ).map(
          (review) => [
            review.lead_id,
            review,
          ]
        )
      );


    /*
     * -----------------------------------------
     * IMPORTANT
     *
     * id MUST ALWAYS remain leads.id.
     *
     * We also expose lead_id explicitly so
     * the frontend can never accidentally
     * send financial_reviews.id.
     * -----------------------------------------
     */

    return (
      leads ??
      []
    ).map(
      (lead) => {

        const review =
          reviewMap.get(
            lead.id
          );


        return {
          ...lead,

          /*
           * Force these AFTER the spread.
           */
          id:
            lead.id,

          lead_id:
            lead.id,


          financial_review:
            review
              ? {
                  ...review,

                  lead_id:
                    lead.id,
                }
              : {
                  id:
                    null,

                  lead_id:
                    lead.id,

                  decision:
                    "pending",

                  review_notes:
                    null,

                  reviewed_by:
                    null,

                  reviewed_at:
                    null,

                  created_at:
                    null,

                  updated_at:
                    null,
                },
        };
      }
    );
  };


/*
 * =========================================================
 * GET ONE
 * =========================================================
 */

export const getFinancialReviewLead =
  async (
    leadId: string
  ) => {

    const leads =
      await getFinancialReviewLeads();


    const lead =
      leads.find(
        (item) =>
          item.id ===
            leadId ||
          item.lead_id ===
            leadId
      );


    if (!lead) {

      throw new Error(
        `Lead not found: ${leadId}`
      );
    }


    return lead;
  };


/*
 * =========================================================
 * SAVE APPROVE / REJECT
 * =========================================================
 */

export const saveFinancialDecision =
  async (
    input:
      ReviewDecisionInput
  ) => {

    /*
     * =====================================================
     * NORMALIZE LEAD ID
     * =====================================================
     */

    const leadId =
      input.leadId
        ?.trim();


    console.log(
      "FINANCIAL DECISION LEAD ID:",
      leadId
    );


    if (!leadId) {

      throw new Error(
        "Lead ID is missing"
      );
    }


    /*
     * =====================================================
     * VERIFY LEAD EXISTS
     *
     * IMPORTANT:
     *
     * Your leads table does NOT contain
     * a column named "status".
     *
     * We only need the primary key here.
     * =====================================================
     */

    const {
      data: lead,
      error: leadError,
    } =
      await supabaseAdmin
        .from("leads")
        .select("id")
        .eq(
          "id",
          leadId
        )
        .maybeSingle();


    if (leadError) {

      console.error(
        "FINANCIAL LEAD LOOKUP ERROR:",
        leadError
      );


      throw new Error(
        `Unable to verify lead: ${leadError.message}`
      );
    }


    if (!lead) {

      console.error(
        "FINANCIAL LEAD NOT FOUND:",
        leadId
      );


      throw new Error(
        `Lead not found: ${leadId}`
      );
    }


    console.log(
      "FINANCIAL LEAD VERIFIED:",
      lead
    );


    /*
     * =====================================================
     * SAVE FINANCIAL DECISION
     *
     * Finance only changes:
     *
     * financial_reviews.decision
     *
     * Finance does NOT change Hot/Cold.
     * =====================================================
     */

    const {
      data: review,
      error: reviewError,
    } =
      await supabaseAdmin
        .from(
          "financial_reviews"
        )
        .upsert(
          {
            lead_id:
              leadId,

            decision:
              input.decision,

            review_notes:
              input.notes,

            reviewed_by:
              input.reviewedBy,

            reviewed_at:
              new Date()
                .toISOString(),

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "lead_id",
          }
        )
        .select(`
          id,
          lead_id,
          decision,
          review_notes,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        `)
        .single();


    if (reviewError) {

      console.error(
        "SAVE FINANCIAL REVIEW ERROR:",
        reviewError
      );


      throw new Error(
        `Unable to save Financial Review: ${reviewError.message}`
      );
    }


    console.log(
      "FINANCIAL REVIEW SAVED:",
      review
    );


    return review;
  };

/*
 * =========================================================
 * REJECTED
 * =========================================================
 */

export const getRejectedFinancialLeads =
  async () => {

    const leads =
      await getFinancialReviewLeads();


    return leads.filter(
      (lead) =>
        lead
          .financial_review
          ?.decision ===
        "rejected"
    );
  };


/*
 * =========================================================
 * APPROVED FOR TECHNICAL REVIEW
 * =========================================================
 */

export const getFinanciallyApprovedLeads =
  async () => {

    const leads =
      await getFinancialReviewLeads();


    return leads.filter(
      (lead) =>
        lead
          .financial_review
          ?.decision ===
        "approved"
    );
  };