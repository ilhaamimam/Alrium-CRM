import {
  supabaseAdmin,
} from "../config/supabase";


export interface TechnicalDecisionInput {
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
 * AVAILABLE TEAM MEMBERS
 * =========================================================
 */

export const getAvailableTeamMembers =
  async () => {

    /*
     * IMPORTANT:
     *
     * Only users whose CRM role is:
     *
     * team_member
     *
     * are considered delivery team members.
     */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          availability_status
        `)
        .eq(
          "role",
          "team_member"
        )
        .eq(
          "availability_status",
          "available"
        )
        .order(
          "email",
          {
            ascending: true,
          }
        );


    if (error) {

      console.error(
        "AVAILABLE TEAM MEMBERS ERROR:",
        error
      );


      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };


/*
 * =========================================================
 * TECHNICAL REVIEW LEADS
 *
 * ONLY:
 *
 * financial_reviews.decision = approved
 * =========================================================
 */

export const getTechnicalReviewLeads =
  async () => {

    /*
     * -------------------------------------------------------
     * FIND FINANCIALLY APPROVED LEADS
     * -------------------------------------------------------
     */

    const {
      data:
        financialReviews,
      error:
        financialError,
    } =
      await supabaseAdmin
        .from(
          "financial_reviews"
        )
        .select(`
          lead_id,
          decision
        `)
        .eq(
          "decision",
          "approved"
        );


    if (financialError) {

      console.error(
        "FINANCIAL APPROVED QUERY ERROR:",
        financialError
      );


      throw new Error(
        financialError.message
      );
    }


    const leadIds =
      (
        financialReviews ??
        []
      )
        .map(
          (review) =>
            review.lead_id
        )
        .filter(Boolean);


    /*
     * Nothing for Technical Review.
     */

    if (
      leadIds.length ===
      0
    ) {

      return [];
    }


    /*
     * -------------------------------------------------------
     * LOAD LEADS
     *
     * status now exists and contains:
     *
     * cold / hot
     * -------------------------------------------------------
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
        .in(
          "id",
          leadIds
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (leadsError) {

      console.error(
        "TECHNICAL LEADS ERROR:",
        leadsError
      );


      throw new Error(
        leadsError.message
      );
    }


    /*
     * -------------------------------------------------------
     * LOAD TECHNICAL REVIEW RECORDS
     * -------------------------------------------------------
     */

    const {
      data:
        technicalReviews,
      error:
        technicalError,
    } =
      await supabaseAdmin
        .from(
          "technical_reviews"
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
        .in(
          "lead_id",
          leadIds
        );


    if (technicalError) {

      console.error(
        "TECHNICAL REVIEW QUERY ERROR:",
        technicalError
      );


      throw new Error(
        technicalError.message
      );
    }


    /*
     * -------------------------------------------------------
     * CREATE LOOKUP
     * -------------------------------------------------------
     */

    const reviewMap =
      new Map(
        (
          technicalReviews ??
          []
        ).map(
          (review) => [
            review.lead_id,
            review,
          ]
        )
      );


    /*
     * -------------------------------------------------------
     * RETURN LEADS
     *
     * No technical_review row yet means:
     *
     * decision = pending
     * -------------------------------------------------------
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

          id:
            lead.id,

          lead_id:
            lead.id,

          /*
           * Canonical Hot/Cold field.
           */
          status:
            lead.status ||
            "cold",

          technical_review:
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
 * ONE TECHNICAL REVIEW LEAD
 * =========================================================
 */

export const getTechnicalReviewLead =
  async (
    leadId: string
  ) => {

    const leads =
      await getTechnicalReviewLeads();


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
        "Lead is not available for Technical Review"
      );
    }


    return lead;
  };


/*
 * =========================================================
 * SAVE TECHNICAL DECISION
 * =========================================================
 */

export const saveTechnicalDecision =
  async (
    input:
      TechnicalDecisionInput
  ) => {

    const leadId =
      input.leadId
        ?.trim();


    if (!leadId) {

      throw new Error(
        "Lead ID is missing"
      );
    }


    console.log(
      "TECHNICAL DECISION LEAD ID:",
      leadId
    );


    /*
     * =====================================================
     * 1. VERIFY FINANCE APPROVED IT
     * =====================================================
     */

    const {
      data:
        financialReview,
      error:
        financialError,
    } =
      await supabaseAdmin
        .from(
          "financial_reviews"
        )
        .select(`
          lead_id,
          decision
        `)
        .eq(
          "lead_id",
          leadId
        )
        .eq(
          "decision",
          "approved"
        )
        .maybeSingle();


    if (financialError) {

      console.error(
        "TECHNICAL FINANCE CHECK ERROR:",
        financialError
      );


      throw new Error(
        financialError.message
      );
    }


    if (!financialReview) {

      throw new Error(
        "This lead has not been approved by Financial Review"
      );
    }


    /*
     * =====================================================
     * 2. VERIFY LEAD EXISTS
     * =====================================================
     */

    const {
      data: lead,
      error: leadError,
    } =
      await supabaseAdmin
        .from("leads")
        .select(`
          id,
          status
        `)
        .eq(
          "id",
          leadId
        )
        .maybeSingle();


    if (leadError) {

      console.error(
        "TECHNICAL LEAD CHECK ERROR:",
        leadError
      );


      throw new Error(
        leadError.message
      );
    }


    if (!lead) {

      throw new Error(
        "Lead not found"
      );
    }


    /*
     * =====================================================
     * 3. APPROVAL REQUIRES AVAILABLE TEAM MEMBER
     * =====================================================
     */

    if (
      input.decision ===
      "approved"
    ) {

      const members =
        await getAvailableTeamMembers();


      if (
        members.length ===
        0
      ) {

        throw new Error(
          "Technical approval is not possible because there are no available team members"
        );
      }
    }


    /*
     * =====================================================
     * 4. SAVE TECHNICAL REVIEW
     * =====================================================
     */

    const {
      data: review,
      error: reviewError,
    } =
      await supabaseAdmin
        .from(
          "technical_reviews"
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
        "SAVE TECHNICAL REVIEW ERROR:",
        reviewError
      );


      throw new Error(
        reviewError.message
      );
    }


    /*
     * =====================================================
     * 5. UPDATE HOT / COLD
     *
     * APPROVED:
     *     HOT
     *
     * REJECTED:
     *     COLD
     * =====================================================
     */

    const newStatus =
      input.decision ===
        "approved"
        ? "hot"
        : "cold";


    const {
      data:
        updatedLead,
      error:
        updateLeadError,
    } =
      await supabaseAdmin
        .from("leads")
        .update({
          status:
            newStatus,
        })
        .eq(
          "id",
          leadId
        )
        .select(`
          id,
          status
        `)
        .single();


    if (updateLeadError) {

      console.error(
        "UPDATE HOT COLD ERROR:",
        updateLeadError
      );


      throw new Error(
        `Unable to update lead Hot/Cold status: ${updateLeadError.message}`
      );
    }


    console.log(
      "TECHNICAL REVIEW SAVED:",
      review
    );


    console.log(
      "LEAD STATUS UPDATED:",
      updatedLead
    );


    return {
      review,

      lead:
        updatedLead,
    };
  };


/*
 * =========================================================
 * TECHNICALLY APPROVED
 *
 * SALES MANAGER DASHBOARD
 * =========================================================
 */

export const getProductionReadyLeads =
  async () => {

    const leads =
      await getTechnicalReviewLeads();


    return leads.filter(
      (lead) =>
        lead
          .technical_review
          ?.decision ===
        "approved"
    );
  };


/*
 * =========================================================
 * TECHNICALLY REJECTED
 *
 * SALES MANAGER DASHBOARD
 * =========================================================
 */

export const getTechnicallyRejectedLeads =
  async () => {

    const leads =
      await getTechnicalReviewLeads();


    return leads.filter(
      (lead) =>
        lead
          .technical_review
          ?.decision ===
        "rejected"
    );
  };