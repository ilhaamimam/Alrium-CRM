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


export default function TeamAllocationPage() {

  const [
    teams,
    setTeams,
  ] =
    useState<
      Team[]
    >([]);


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


          setTeams(
            teamData
          );


          setMembers(
            memberData
          );


          setProjects(
            projectData
          );

        } catch (error) {

          console.error(
            "LOAD TEAM ALLOCATION DATA ERROR:",
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

  }, [
    loadData,
  ]);


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
      <p>
        Loading Team Allocation...
      </p>
    );
  }


  return (
    <div>

      <h1>
        Team Allocation & Management
      </h1>


      <p>
        Senior Manager
      </p>


      {error && (
        <p>
          {error}
        </p>
      )}


      <hr />


      <TeamForm
        onCreated={
          refreshAll
        }
      />


      <hr />


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


      <hr />


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


      <hr />


      <TeamAssignedLeadsTable
        teams={
          teams
        }

        refreshKey={
          refreshKey
        }
      />

    </div>
  );
}