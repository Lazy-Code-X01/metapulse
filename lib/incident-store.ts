import { IncidentReport } from '@/types';

let incidents: IncidentReport[] = [];

export const addIncident = (incident: IncidentReport): void => {
  incidents.unshift(incident);
  if (incidents.length > 50) incidents.pop();
};

export const getIncidents = (): IncidentReport[] => {
  return [...incidents];
};
