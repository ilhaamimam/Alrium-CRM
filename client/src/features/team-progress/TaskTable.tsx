import axios from "axios";

import {
  useState,
} from "react";

import {
  updateTaskProgressStatus,
} from "./teamProgress.api";

import type {
  ProjectTask,
  TaskProgressStatus,
} from "./teamProgress.types";


interface Props {
  tasks:
    ProjectTask[];

  onChanged:
    () => void;
}


export default function TaskTable({
  tasks,
  onChanged,
}: Props) {

  const [
    updatingTaskId,
    setUpdatingTaskId,
  ] =
    useState<
      string | null
    >(null);


  const [
    error,
    setError,
  ] =
    useState("");


  const updateStatus =
    async (
      taskId: string,
      status:
        TaskProgressStatus
    ) => {

      try {

        setError("");

        setUpdatingTaskId(
          taskId
        );


        await updateTaskProgressStatus(
          taskId,
          status
        );


        await onChanged();

      } catch (error) {

        console.error(
          "UPDATE TASK ERROR:",
          error
        );


        if (
          axios.isAxiosError(
            error
          )
        ) {

          setError(
            error.response
              ?.data
              ?.message ||
              "Unable to update task"
          );

        } else {

          setError(
            "Unable to update task"
          );
        }

      } finally {

        setUpdatingTaskId(
          null
        );

      }
    };


  if (
    tasks.length ===
    0
  ) {
    return (
      <div className="empty-state">
        No tasks have been created
        for this project.
      </div>
    );
  }


  return (
    <div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="table-wrap">

        <table>

          <thead>
            <tr>

              <th>
                Task
              </th>

              <th>
                Assigned To
              </th>

              <th>
                Due Date
              </th>

              <th>
                Status
              </th>

              <th>
                Actions
              </th>

            </tr>
          </thead>


          <tbody>

            {tasks.map(
              (task) => {

                const updating =
                  updatingTaskId ===
                  task.id;


                return (
                  <tr
                    key={
                      task.id
                    }
                  >

                    <td>

                      <strong>
                        {task.title}
                      </strong>


                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}

                    </td>


                    <td>

                      {task
                        .assignee
                        ?.full_name ||
                        task
                          .assignee
                          ?.email ||
                        "-"}

                    </td>


                    <td>
                      {task.due_date ||
                        "-"}
                    </td>


                    <td>

                      <span
                        className={
                          `task-status task-status-${task.status}`
                        }
                      >
                        {task.status.replace(
                          "_",
                          " "
                        )}
                      </span>

                    </td>


                    <td>

                      <div className="task-actions">

                        {task.status !==
                          "ongoing" &&
                          task.status !==
                            "done" && (

                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              updateStatus(
                                task.id,
                                "ongoing"
                              )
                            }
                          >
                            Start
                          </button>
                        )}


                        {task.status !==
                          "on_hold" &&
                          task.status !==
                            "done" && (

                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              updateStatus(
                                task.id,
                                "on_hold"
                              )
                            }
                          >
                            Hold
                          </button>
                        )}


                        {task.status !==
                          "done" && (

                          <button
                            type="button"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              updateStatus(
                                task.id,
                                "done"
                              )
                            }
                          >
                            Mark Done
                          </button>
                        )}


                        {task.status ===
                          "done" && (

                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              updateStatus(
                                task.id,
                                "ongoing"
                              )
                            }
                          >
                            Reopen
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}