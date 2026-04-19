import api from '../lib/axios';
import { IngestRequest, IngestResponse } from './types/agent_type';

export const ingestRepo = async (githubUrl: string) => {
  const response = await api.post<IngestResponse>('/agent/ingest', { 
    github_url: githubUrl 
  });
  return response.data;
};
