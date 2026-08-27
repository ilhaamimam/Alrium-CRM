import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchAvailableTeamMembers,
  fetchProjectsForAllocation,
  fetchTeams,
} from "./teamAllocation.api";

import TeamForm
  from "./TeamForm";

import TeamMembersManager
  from "./TeamMembersManager";

import ProjectTeamAssignmentForm
  from "./ProjectTeamAssignmentForm";

import TeamAssignedLeadsTable
  from "./TeamAssignedLeadsTable";

import type {
  AllocationProject,
  Team,
  TeamMemberProfile,
} from "./teamAllocation.types";

import "./teamAllocation.css";


export default function TeamAllocationPage() {
  const [
    teams,
    setTeams,
  ] =
    useState<Team[]>([]);

  const [
    members,
    setMembers,
  ] =
    useState<
      TeamMemberProfile[]
    >([]);

  const [
    projects,
    setProjects,
  ] =
    useState<
      AllocationProject[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);


  const loadData =
    useCallback(
      async () => {
        try {
          setError("");

          const [
            teamData,
            memberData,
            projectData,
          ] =
            await Promise.all([
              fetchTeams(),

              fetchAvailableTeamMembers(),

              fetchProjectsForAllocation(),
            ]);


          setTeams(teamData);

          setMembers(
            memberData
          );

          setProjects(
            projectData
          );

        } catch (error) {
          console.error(
            "LOAD TEAM ALLOCATION ERROR:",
            error
          );

          setError(
            "Unable to load Team Allocation Management"
          );

        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadData();
  }, [loadData]);


  const refreshAll =
    async () => {
      await loadData();

      setRefreshKey(
        (current) =>
          current + 1
      );
    };


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading Team Allocation...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Team Allocation & Management
        </h1>

        <p className="page-subtitle">
          Create teams, manage members,
          allocate approved leads and
          maintain project timelines.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="team-management-grid">

        <div className="card team-management-section">

          <TeamForm
            onCreated={
              refreshAll
            }
          />

        </div>


        <div className="card team-management-section">

          <TeamMembersManager
            teams={
              teams
            }

            availableMembers={
              members
            }

            onChanged={
              refreshAll
            }
          />

        </div>

      </div>


      <div className="card section">

        <ProjectTeamAssignmentForm
          teams={
            teams
          }

          projects={
            projects
          }

          onAssigned={
            refreshAll
          }
        />

      </div>


      <div className="card section">

        <TeamAssignedLeadsTable
          teams={
            teams
          }

          refreshKey={
            refreshKey
          }
        />

      </div>

    </div>
  );
}