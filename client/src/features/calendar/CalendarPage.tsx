import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  createCalendarReminder,
  deleteCalendarReminder,
  fetchCalendarEvents,
  fetchCalendarLeads,
  updateCalendarReminder,
} from "./calendar.api";

import type {
  CalendarEvent,
  CalendarFilter,
  CalendarLeadOption,
  ReminderType,
} from "./calendar.types";

import "./calendar.css";


const monthNames =
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


const weekdayNames =
  [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];


export default function CalendarPage() {
  /*
   * =========================================================
   * CURRENT MONTH
   * =========================================================
   */

  const now =
    new Date();


  const [
    currentMonth,
    setCurrentMonth,
  ] =
    useState(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );


  /*
   * =========================================================
   * DATA
   * =========================================================
   */

  const [
    events,
    setEvents,
  ] =
    useState<
      CalendarEvent[]
    >([]);


  const [
    leads,
    setLeads,
  ] =
    useState<
      CalendarLeadOption[]
    >([]);


  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  const [
    filter,
    setFilter,
  ] =
    useState<
      CalendarFilter
    >("all");


  const [
    search,
    setSearch,
  ] =
    useState("");


  /*
   * =========================================================
   * MODALS
   * =========================================================
   */

  const [
    selectedEvent,
    setSelectedEvent,
  ] =
    useState<
      CalendarEvent | null
    >(null);


  const [
    showReminderModal,
    setShowReminderModal,
  ] =
    useState(false);


  const [
    editingReminderId,
    setEditingReminderId,
  ] =
    useState<
      string | null
    >(null);


  /*
   * =========================================================
   * REMINDER FORM
   * =========================================================
   */

  const [
    reminderLeadId,
    setReminderLeadId,
  ] =
    useState("");


  const [
    reminderTitle,
    setReminderTitle,
  ] =
    useState("");


  const [
    reminderDescription,
    setReminderDescription,
  ] =
    useState("");


  const [
    reminderDate,
    setReminderDate,
  ] =
    useState(
      formatDateInput(
        new Date()
      )
    );


  const [
    reminderTime,
    setReminderTime,
  ] =
    useState("");


  const [
    reminderType,
    setReminderType,
  ] =
    useState<
      ReminderType
    >("follow_up");


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    savingReminder,
    setSavingReminder,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  /*
   * =========================================================
   * DATE RANGE
   *
   * Load enough days to fully populate the visible 6-week
   * month grid.
   * =========================================================
   */

  const visibleDates =
    useMemo(
      () =>
        buildCalendarDates(
          currentMonth
        ),
      [
        currentMonth,
      ]
    );


  const rangeStart =
    formatDateInput(
      visibleDates[0]
    );


  const rangeEnd =
    formatDateInput(
      visibleDates[
        visibleDates.length -
        1
      ]
    );


  /*
   * =========================================================
   * LOAD LEAD OPTIONS
   * =========================================================
   */

  const loadLeads =
    useCallback(
      async () => {

        const data =
          await fetchCalendarLeads();


        setLeads(
          data
        );

      },
      []
    );


  /*
   * =========================================================
   * LOAD EVENTS
   * =========================================================
   */

  const loadEvents =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const data =
            await fetchCalendarEvents(
              rangeStart,
              rangeEnd
            );


          setEvents(
            data
          );

        } catch (error) {

          console.error(
            "CALENDAR LOAD ERROR:",
            error
          );


          setError(
            getErrorMessage(
              error,
              "Unable to load Calendar"
            )
          );

        } finally {

          setLoading(
            false
          );

        }
      },
      [
        rangeEnd,
        rangeStart,
      ]
    );


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    void loadLeads();

  }, [
    loadLeads,
  ]);


  useEffect(() => {

    void loadEvents();

  }, [
    loadEvents,
  ]);


  /*
   * =========================================================
   * FILTER EVENTS
   * =========================================================
   */

  const filteredEvents =
    useMemo(
      () => {

        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return events.filter(
          (
            event
          ) => {

            /*
             * Search
             */

            if (
              normalizedSearch
            ) {

              const searchable =
                [
                  event.title,
                  event.company_name,
                  event.label,
                  event.description,
                ]
                  .filter(
                    Boolean
                  )
                  .join(" ")
                  .toLowerCase();


              if (
                !searchable.includes(
                  normalizedSearch
                )
              ) {

                return false;
              }
            }


            /*
             * Category filter
             */

            switch (
              filter
            ) {

              case "created":

                return (
                  event.event_type ===
                  "lead_created"
                );


              case "pending":

                return [
                  "finance_pending",
                  "technical_pending",
                  "completion_pending",
                  "changes_required",
                ].includes(
                  event.event_type
                );


              case "deadlines":

                return (
                  event.event_type ===
                    "project_start" ||
                  event.event_type ===
                    "project_deadline"
                );


              case "completed":

                return (
                  event.event_type ===
                  "completed"
                );


              case "reminders":

                return (
                  event.event_type ===
                  "reminder"
                );


              case "all":
              default:

                return true;
            }
          }
        );

      },
      [
        events,
        filter,
        search,
      ]
    );


  /*
   * =========================================================
   * EVENTS BY DATE
   * =========================================================
   */

  const eventsByDate =
    useMemo(
      () => {

        const map =
          new Map<
            string,
            CalendarEvent[]
          >();


        filteredEvents.forEach(
          (
            event
          ) => {

            const current =
              map.get(
                event.date
              ) ??
              [];


            current.push(
              event
            );


            map.set(
              event.date,
              current
            );
          }
        );


        return map;

      },
      [
        filteredEvents,
      ]
    );


  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const summary =
    useMemo(
      () => {

        return {
          all:
            events.length,

          pending:
            events.filter(
              (
                event
              ) =>
                [
                  "finance_pending",
                  "technical_pending",
                  "completion_pending",
                  "changes_required",
                ].includes(
                  event.event_type
                )
            ).length,

          deadlines:
            events.filter(
              (
                event
              ) =>
                event.event_type ===
                "project_deadline"
            ).length,

          completed:
            events.filter(
              (
                event
              ) =>
                event.event_type ===
                "completed"
            ).length,

          reminders:
            events.filter(
              (
                event
              ) =>
                event.event_type ===
                "reminder" &&
                event
                  .reminder_status ===
                  "pending"
            ).length,
        };

      },
      [
        events,
      ]
    );


  /*
   * =========================================================
   * MONTH NAVIGATION
   * =========================================================
   */

  const goPreviousMonth =
    () => {

      setCurrentMonth(
        (
          current
        ) =>
          new Date(
            current.getFullYear(),
            current.getMonth() -
              1,
            1
          )
      );
    };


  const goNextMonth =
    () => {

      setCurrentMonth(
        (
          current
        ) =>
          new Date(
            current.getFullYear(),
            current.getMonth() +
              1,
            1
          )
      );
    };


  const goToday =
    () => {

      const today =
        new Date();


      setCurrentMonth(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
      );
    };


  /*
   * =========================================================
   * NEW REMINDER
   * =========================================================
   */

  const openNewReminder =
    (
      leadId?:
        string,

      date?:
        string
    ) => {

      setEditingReminderId(
        null
      );


      setReminderLeadId(
        leadId ??
        ""
      );


      setReminderTitle("");

      setReminderDescription("");

      setReminderDate(
        date ??
        formatDateInput(
          new Date()
        )
      );

      setReminderTime("");

      setReminderType(
        "follow_up"
      );

      setShowReminderModal(
        true
      );
    };


  /*
   * =========================================================
   * EDIT REMINDER
   * =========================================================
   */

  const openEditReminder =
    (
      event:
        CalendarEvent
    ) => {

      if (
        !event.reminder_id
      ) {

        return;
      }


      setEditingReminderId(
        event.reminder_id
      );

      setReminderLeadId(
        event.lead_id
      );

      setReminderTitle(
        event.label
      );

      setReminderDescription(
        event.description ??
        ""
      );

      setReminderDate(
        event.date
      );

      setReminderTime(
        event.time ??
        ""
      );

      setReminderType(
        normalizeReminderType(
          event.workflow_status
        )
      );

      setSelectedEvent(
        null
      );

      setShowReminderModal(
        true
      );
    };


  /*
   * =========================================================
   * SAVE REMINDER
   * =========================================================
   */

  const handleSaveReminder =
    async () => {

      if (
        !reminderLeadId
      ) {

        setError(
          "Select a lead"
        );

        return;
      }


      if (
        !reminderTitle
          .trim()
      ) {

        setError(
          "Reminder title is required"
        );

        return;
      }


      if (
        !reminderDate
      ) {

        setError(
          "Reminder date is required"
        );

        return;
      }


      try {

        setSavingReminder(
          true
        );

        setError("");

        setSuccess("");


        if (
          editingReminderId
        ) {

          await updateCalendarReminder(
            editingReminderId,
            {
              title:
                reminderTitle
                  .trim(),

              description:
                reminderDescription
                  .trim() ||
                null,

              reminderDate,

              reminderTime:
                reminderTime ||
                null,

              reminderType,
            }
          );


          setSuccess(
            "Reminder updated"
          );

        } else {

          await createCalendarReminder({
            leadId:
              reminderLeadId,

            title:
              reminderTitle
                .trim(),

            description:
              reminderDescription
                .trim() ||
              null,

            reminderDate,

            reminderTime:
              reminderTime ||
              null,

            reminderType,
          });


          setSuccess(
            "Reminder created"
          );
        }


        setShowReminderModal(
          false
        );


        await loadEvents();

      } catch (error) {

        setError(
          getErrorMessage(
            error,
            "Unable to save reminder"
          )
        );

      } finally {

        setSavingReminder(
          false
        );

      }
    };


  /*
   * =========================================================
   * MARK REMINDER DONE
   * =========================================================
   */

  const handleCompleteReminder =
    async (
      reminderId: string
    ) => {

      try {

        setError("");


        await updateCalendarReminder(
          reminderId,
          {
            status:
              "done",
          }
        );


        setSelectedEvent(
          null
        );


        setSuccess(
          "Reminder completed"
        );


        await loadEvents();

      } catch (error) {

        setError(
          getErrorMessage(
            error,
            "Unable to complete reminder"
          )
        );
      }
    };


  /*
   * =========================================================
   * DELETE REMINDER
   * =========================================================
   */

  const handleDeleteReminder =
    async (
      reminderId:
        string
    ) => {

      if (
        !window.confirm(
          "Delete this reminder?"
        )
      ) {

        return;
      }


      try {

        setError("");


        await deleteCalendarReminder(
          reminderId
        );


        setSelectedEvent(
          null
        );


        setSuccess(
          "Reminder deleted"
        );


        await loadEvents();

      } catch (error) {

        setError(
          getErrorMessage(
            error,
            "Unable to delete reminder"
          )
        );
      }
    };


  /*
   * =========================================================
   * YEARS
   * =========================================================
   */

  const yearOptions =
    useMemo(
      () => {

        const currentYear =
          new Date()
            .getFullYear();


        const years:
          number[] =
          [];


        for (
          let year =
            currentYear -
            5;
          year <=
          currentYear +
            10;
          year +=
            1
        ) {

          years.push(
            year
          );
        }


        return years;

      },
      []
    );


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="page-shell calendar-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header calendar-page-header">

        <div>

          <h1 className="page-title">
            Calendar
          </h1>


          <p className="page-subtitle">
            Track lead dates, delivery deadlines,
            pending updates, completed work and
            personal reminders.
          </p>

        </div>


        <button
          type="button"
          className="calendar-new-reminder"
          onClick={() =>
            openNewReminder()
          }
        >
          + New Reminder
        </button>

      </div>


      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (

        <div className="calendar-error">
          {error}
        </div>

      )}


      {success && (

        <div className="calendar-success">
          {success}
        </div>

      )}


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="calendar-summary-grid">

        <SummaryCard
          label="All Events"
          value={
            summary.all
          }
        />


        <SummaryCard
          label="Pending"
          value={
            summary.pending
          }
          accent
        />


        <SummaryCard
          label="Deadlines"
          value={
            summary.deadlines
          }
        />


        <SummaryCard
          label="Completed"
          value={
            summary.completed
          }
        />


        <SummaryCard
          label="My Reminders"
          value={
            summary.reminders
          }
        />

      </div>


      {/* =====================================================
          CONTROLS
      ====================================================== */}

      <section className="card calendar-controls">

        <div className="calendar-navigation">

          <button
            type="button"
            onClick={
              goPreviousMonth
            }
          >
            ←
          </button>


          <button
            type="button"
            onClick={
              goToday
            }
          >
            Today
          </button>


          <button
            type="button"
            onClick={
              goNextMonth
            }
          >
            →
          </button>

        </div>


        <div className="calendar-month-selectors">

          <select
            value={
              currentMonth
                .getMonth()
            }
            onChange={(
              event
            ) =>
              setCurrentMonth(
                new Date(
                  currentMonth
                    .getFullYear(),
                  Number(
                    event.target
                      .value
                  ),
                  1
                )
              )
            }
          >

            {monthNames.map(
              (
                month,
                index
              ) => (

                <option
                  key={
                    month
                  }
                  value={
                    index
                  }
                >
                  {month}
                </option>

              )
            )}

          </select>


          <select
            value={
              currentMonth
                .getFullYear()
            }
            onChange={(
              event
            ) =>
              setCurrentMonth(
                new Date(
                  Number(
                    event.target
                      .value
                  ),
                  currentMonth
                    .getMonth(),
                  1
                )
              )
            }
          >

            {yearOptions.map(
              (
                year
              ) => (

                <option
                  key={
                    year
                  }
                  value={
                    year
                  }
                >
                  {year}
                </option>

              )
            )}

          </select>

        </div>


        <div className="calendar-search">

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search lead, company or event..."
          />

        </div>

      </section>


      {/* =====================================================
          FILTER BUTTONS
      ====================================================== */}

      <div className="calendar-filters">

        <CalendarFilterButton
          label="All"
          value="all"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />


        <CalendarFilterButton
          label="Created"
          value="created"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />


        <CalendarFilterButton
          label="Pending"
          value="pending"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />


        <CalendarFilterButton
          label="Deadlines"
          value="deadlines"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />


        <CalendarFilterButton
          label="Completed"
          value="completed"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />


        <CalendarFilterButton
          label="Reminders"
          value="reminders"
          current={
            filter
          }
          onChange={
            setFilter
          }
        />

      </div>


      {/* =====================================================
          MONTH TITLE
      ====================================================== */}

      <section className="card calendar-main-card">

        <div className="calendar-title-row">

          <div>

            <span className="calendar-eyebrow">
              Lead Timeline
            </span>


            <h2>

              {
                monthNames[
                  currentMonth
                    .getMonth()
                ]
              }{" "}

              {currentMonth
                .getFullYear()}

            </h2>

          </div>


          {loading && (

            <span className="calendar-loading-label">
              Loading...
            </span>

          )}

        </div>


        {/* =================================================
            WEEK HEADERS
        ================================================== */}

        <div className="calendar-weekdays">

          {weekdayNames.map(
            (
              weekday
            ) => (

              <div
                key={
                  weekday
                }
              >
                {weekday}
              </div>

            )
          )}

        </div>


        {/* =================================================
            CALENDAR GRID
        ================================================== */}

        <div className="calendar-grid">

          {visibleDates.map(
            (
              date
            ) => {

              const dateString =
                formatDateInput(
                  date
                );


              const dateEvents =
                eventsByDate.get(
                  dateString
                ) ??
                [];


              const inCurrentMonth =
                date.getMonth() ===
                  currentMonth
                    .getMonth() &&
                date.getFullYear() ===
                  currentMonth
                    .getFullYear();


              const today =
                isSameDate(
                  date,
                  new Date()
                );


              return (

                <div
                  key={
                    dateString
                  }
                  className={
                    [
                      "calendar-day",

                      !inCurrentMonth
                        ? "calendar-day-outside"
                        : "",

                      today
                        ? "calendar-day-today"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(" ")
                  }
                >

                  <div className="calendar-day-header">

                    <span>
                      {date.getDate()}
                    </span>


                    <button
                      type="button"
                      title="Add reminder"
                      onClick={() =>
                        openNewReminder(
                          undefined,
                          dateString
                        )
                      }
                    >
                      +
                    </button>

                  </div>


                  <div className="calendar-day-events">

                    {dateEvents
                      .slice(
                        0,
                        4
                      )
                      .map(
                        (
                          event
                        ) => (

                          <button
                            key={
                              event.id
                            }
                            type="button"
                            className={
                              `calendar-event calendar-event-${event.event_type}`
                            }
                            onClick={() =>
                              setSelectedEvent(
                                event
                              )
                            }
                          >

                            <strong>
                              {event.label}
                            </strong>


                            <span>
                              {event.title}
                            </span>


                            {getShortCountdown(
                              event
                            ) && (

                              <small>

                                {getShortCountdown(
                                  event
                                )}

                              </small>

                            )}

                          </button>

                        )
                      )}


                    {dateEvents.length >
                      4 && (

                      <span className="calendar-more-events">

                        +
                        {
                          dateEvents.length -
                          4
                        }{" "}
                        more

                      </span>

                    )}

                  </div>

                </div>

              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          EVENT DETAILS MODAL
      ====================================================== */}

      {selectedEvent && (

        <CalendarModal
          title={
            selectedEvent.label
          }
          onClose={() =>
            setSelectedEvent(
              null
            )
          }
        >

          <div className="calendar-event-detail">

            <div className="calendar-event-detail-header">

              <div>

                <span className="calendar-eyebrow">
                  {
                    selectedEvent
                      .event_type ===
                    "reminder"
                      ? "Reminder"
                      : "Lead Event"
                  }
                </span>


                <h3>
                  {
                    selectedEvent
                      .title
                  }
                </h3>

              </div>


              <LeadBadge
                status={
                  selectedEvent
                    .lead_status
                }
              />

            </div>


            <DetailRow
              label="Company"
              value={
                selectedEvent
                  .company_name ||
                "-"
              }
            />


            <DetailRow
              label="Date"
              value={
                formatHumanDate(
                  selectedEvent
                    .date
                )
              }
            />


            {selectedEvent.time && (

              <DetailRow
                label="Time"
                value={
                  selectedEvent.time
                }
              />

            )}


            <DetailRow
              label="Status"
              value={
                formatLabel(
                  selectedEvent
                    .workflow_status ||
                  selectedEvent
                    .event_type
                )
              }
            />


            {selectedEvent.description && (

              <div className="calendar-detail-notes">

                <strong>
                  Details
                </strong>


                <p>
                  {
                    selectedEvent
                      .description
                  }
                </p>

              </div>

            )}


            {getFullCountdown(
              selectedEvent
            ) && (

              <div
                className={
                  selectedEvent
                    .overdue
                    ? "calendar-countdown calendar-countdown-overdue"
                    : "calendar-countdown"
                }
              >

                {getFullCountdown(
                  selectedEvent
                )}

              </div>

            )}


            <div className="calendar-modal-actions">

              <Link
                to={
                  `/leads/${selectedEvent.lead_id}`
                }
                className="calendar-primary-action"
              >
                View Lead
              </Link>


              {selectedEvent
                .event_type !==
                "reminder" && (

                <button
                  type="button"
                  className="calendar-secondary-action"
                  onClick={() => {

                    const leadId =
                      selectedEvent
                        .lead_id;


                    const date =
                      selectedEvent
                        .date;


                    setSelectedEvent(
                      null
                    );


                    openNewReminder(
                      leadId,
                      date
                    );

                  }}
                >
                  Create Reminder
                </button>

              )}


              {selectedEvent
                .event_type ===
                "reminder" &&
                selectedEvent
                  .reminder_id && (

                <>

                  <button
                    type="button"
                    className="calendar-secondary-action"
                    onClick={() =>
                      openEditReminder(
                        selectedEvent
                      )
                    }
                  >
                    Edit
                  </button>


                  {selectedEvent
                    .reminder_status ===
                    "pending" && (

                    <button
                      type="button"
                      className="calendar-secondary-action"
                      onClick={() =>
                        void handleCompleteReminder(
                          selectedEvent
                            .reminder_id!
                        )
                      }
                    >
                      Mark Done
                    </button>

                  )}


                  <button
                    type="button"
                    className="calendar-danger-action"
                    onClick={() =>
                      void handleDeleteReminder(
                        selectedEvent
                          .reminder_id!
                      )
                    }
                  >
                    Delete
                  </button>

                </>

              )}

            </div>

          </div>

        </CalendarModal>

      )}


      {/* =====================================================
          REMINDER MODAL
      ====================================================== */}

      {showReminderModal && (

        <CalendarModal
          title={
            editingReminderId
              ? "Edit Reminder"
              : "New Lead Reminder"
          }
          onClose={() =>
            setShowReminderModal(
              false
            )
          }
        >

          <div className="calendar-reminder-form">

            <div className="form-group">

              <label>
                Lead
              </label>


              <select
                value={
                  reminderLeadId
                }
                disabled={
                  Boolean(
                    editingReminderId
                  )
                }
                onChange={(
                  event
                ) =>
                  setReminderLeadId(
                    event.target
                      .value
                  )
                }
              >

                <option value="">
                  Select Lead
                </option>


                {leads.map(
                  (
                    lead
                  ) => (

                    <option
                      key={
                        lead.id
                      }
                      value={
                        lead.id
                      }
                    >
                      {
                        lead.title
                      }

                      {lead.company_name
                        ? ` — ${lead.company_name}`
                        : ""}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label>
                Reminder Title
              </label>


              <input
                type="text"
                value={
                  reminderTitle
                }
                onChange={(
                  event
                ) =>
                  setReminderTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Call client for update"
              />

            </div>


            <div className="form-group">

              <label>
                Description
              </label>


              <textarea
                value={
                  reminderDescription
                }
                onChange={(
                  event
                ) =>
                  setReminderDescription(
                    event.target
                      .value
                  )
                }
                rows={4}
                placeholder="Optional reminder details..."
              />

            </div>


            <div className="calendar-form-two-column">

              <div className="form-group">

                <label>
                  Date
                </label>


                <input
                  type="date"
                  value={
                    reminderDate
                  }
                  onChange={(
                    event
                  ) =>
                    setReminderDate(
                      event.target
                        .value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Time
                </label>


                <input
                  type="time"
                  value={
                    reminderTime
                  }
                  onChange={(
                    event
                  ) =>
                    setReminderTime(
                      event.target
                        .value
                    )
                  }
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Reminder Type
              </label>


              <select
                value={
                  reminderType
                }
                onChange={(
                  event
                ) =>
                  setReminderType(
                    event.target
                      .value as
                      ReminderType
                  )
                }
              >

                <option value="follow_up">
                  Follow Up
                </option>


                <option value="pending_update">
                  Pending Update
                </option>


                <option value="meeting">
                  Meeting
                </option>


                <option value="deadline">
                  Deadline
                </option>


                <option value="custom">
                  Custom
                </option>

              </select>

            </div>


            <button
              type="button"
              className="calendar-save-reminder"
              disabled={
                savingReminder
              }
              onClick={() =>
                void handleSaveReminder()
              }
            >

              {savingReminder
                ? "Saving..."
                : editingReminderId
                  ? "Save Changes"
                  : "Create Reminder"}

            </button>

          </div>

        </CalendarModal>

      )}

    </div>
  );
}


/*
 * =========================================================
 * SUMMARY CARD
 * =========================================================
 */

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;

  value: number;

  accent?: boolean;
}) {

  return (
    <div
      className={
        accent
          ? "calendar-summary-card calendar-summary-card-accent"
          : "calendar-summary-card"
      }
    >

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


/*
 * =========================================================
 * FILTER BUTTON
 * =========================================================
 */

function CalendarFilterButton({
  label,
  value,
  current,
  onChange,
}: {
  label: string;

  value:
    CalendarFilter;

  current:
    CalendarFilter;

  onChange:
    (
      value:
        CalendarFilter
    ) => void;
}) {

  return (
    <button
      type="button"
      className={
        current ===
        value
          ? "calendar-filter-button calendar-filter-button-active"
          : "calendar-filter-button"
      }
      onClick={() =>
        onChange(
          value
        )
      }
    >
      {label}
    </button>
  );
}


/*
 * =========================================================
 * MODAL
 * =========================================================
 */

function CalendarModal({
  title,
  onClose,
  children,
}: {
  title: string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {

  return (
    <div className="calendar-modal-backdrop">

      <div className="calendar-modal">

        <div className="calendar-modal-header">

          <h2>
            {title}
          </h2>


          <button
            type="button"
            aria-label="Close"
            onClick={
              onClose
            }
          >
            ×
          </button>

        </div>


        <div className="calendar-modal-body">

          {children}

        </div>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * DETAILS
 * =========================================================
 */

function DetailRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {

  return (
    <div className="calendar-detail-row">

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


/*
 * =========================================================
 * LEAD BADGE
 * =========================================================
 */

function LeadBadge({
  status,
}: {
  status:
    string |
    null;
}) {

  const normalized =
    status
      ?.toLowerCase()
      .trim() ||
    "cold";


  const hot =
    normalized ===
    "hot";


  return (
    <span
      className={
        hot
          ? "calendar-lead-tag calendar-lead-tag-hot"
          : "calendar-lead-tag calendar-lead-tag-cold"
      }
    >
      {hot
        ? "HOT"
        : "COLD"}
    </span>
  );
}


/*
 * =========================================================
 * CALENDAR DATES
 * =========================================================
 */

function buildCalendarDates(
  month:
    Date
) {

  const firstDay =
    new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    );


  const start =
    new Date(
      firstDay
    );


  start.setDate(
    start.getDate() -
    firstDay.getDay()
  );


  const dates:
    Date[] =
    [];


  for (
    let index =
      0;
    index <
      42;
    index +=
      1
  ) {

    const date =
      new Date(
        start
      );


    date.setDate(
      start.getDate() +
      index
    );


    dates.push(
      date
    );
  }


  return dates;
}


/*
 * =========================================================
 * DATE HELPERS
 * =========================================================
 */

function formatDateInput(
  value:
    Date
) {

  const year =
    value.getFullYear();


  const month =
    String(
      value.getMonth() +
      1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


function formatHumanDate(
  value:
    string
) {

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(
        Number
      );


  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    [],
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    }
  );
}


function isSameDate(
  a:
    Date,

  b:
    Date
) {

  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}


/*
 * =========================================================
 * COUNTDOWN
 * =========================================================
 */

function getShortCountdown(
  event:
    CalendarEvent
) {

  if (
    event.days_remaining !==
    null
  ) {

    if (
      event.days_remaining ===
      0
    ) {

      return "Due today";
    }


    if (
      event.days_remaining <
      0
    ) {

      return `${Math.abs(
        event.days_remaining
      )}d overdue`;
    }


    return `${event.days_remaining}d left`;
  }


  if (
    event.days_waiting !==
      null &&
    event.days_waiting >
      0
  ) {

    return `${event.days_waiting}d waiting`;
  }


  return "";
}


function getFullCountdown(
  event:
    CalendarEvent
) {

  if (
    event.days_remaining !==
    null
  ) {

    if (
      event.days_remaining ===
      0
    ) {

      return "Due today";
    }


    if (
      event.days_remaining <
      0
    ) {

      return `${Math.abs(
        event.days_remaining
      )} day(s) overdue`;
    }


    return `${event.days_remaining} day(s) remaining`;
  }


  if (
    event.days_waiting !==
    null
  ) {

    if (
      event.days_waiting ===
      0
    ) {

      return "Waiting since today";
    }


    return `${event.days_waiting} day(s) waiting`;
  }


  return "";
}


/*
 * =========================================================
 * LABEL
 * =========================================================
 */

function formatLabel(
  value:
    string
) {

  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter
          .toUpperCase()
    );
}


/*
 * =========================================================
 * REMINDER TYPE
 * =========================================================
 */

function normalizeReminderType(
  value:
    string |
    null
):
  ReminderType {

  switch (
    value
  ) {

    case "follow_up":
    case "pending_update":
    case "meeting":
    case "deadline":
    case "custom":

      return value;


    default:

      return "follow_up";
  }
}


/*
 * =========================================================
 * ERROR
 * =========================================================
 */

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {

  if (
    axios.isAxiosError(
      error
    )
  ) {

    return (
      error.response
        ?.data
        ?.message ||
      fallback
    );
  }


  if (
    error instanceof Error
  ) {

    return error.message;
  }


  return fallback;
}