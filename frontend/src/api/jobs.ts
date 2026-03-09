import jobsData from "../data/jobs.json";

export type JobItem = {
  url: string;
  title: string;
  tags: string[];
  content: string;
};

export const fetchJobsAPI = async (): Promise<JobItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(jobsData as JobItem[]), 300);
  });
};