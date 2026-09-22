-- =========================================================
-- UNIFIED CRM LEAD PIPELINE
-- =========================================================

drop view if exists public.lead_pipeline_v;


create view public.lead_pipeline_v as

select

    /*
     * ORIGINAL LEAD
     */
    l.*,


    /*
     * COMPANY
     */
    c.name as company_name,


    /*
     * CONTACT
     */
    ct.first_name as contact_first_name,
    ct.last_name as contact_last_name,
    ct.email as contact_email,
    ct.phone as contact_phone,


    /*
     * FINANCIAL REVIEW
     */
    coalesce(
        fr.decision,
        'pending'
    ) as financial_decision,

    fr.review_notes
        as financial_review_notes,

    fr.reviewed_at
        as financial_reviewed_at,


    /*
     * TECHNICAL REVIEW
     */
    coalesce(
        tr.decision,
        'pending'
    ) as technical_decision,

    tr.review_notes
        as technical_review_notes,

    tr.reviewed_at
        as technical_reviewed_at,


    /*
     * UNIFIED PIPELINE STAGE
     */
    case

        when tr.decision = 'approved'
            then 'production_ready'

        when tr.decision = 'rejected'
            then 'technical_rejected'

        when fr.decision = 'approved'
            then 'technical_review'

        when fr.decision = 'rejected'
            then 'financial_rejected'

        else
            'financial_review'

    end as pipeline_stage


from public.leads l


left join public.companies c
    on c.id = l.company_id


left join public.contacts ct
    on ct.id = l.contact_id


left join public.financial_reviews fr
    on fr.lead_id = l.id


left join public.technical_reviews tr
    on tr.lead_id = l.id;