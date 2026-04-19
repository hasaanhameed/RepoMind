import api from '../lib/axios';
import { IngestRequest, IngestResponse } from './types/agent_type';

export const ingestRepo = async (github_url: string) => {
  const response = await api.post<IngestResponse>('/agent/ingest', { github_url });
  return response.data;
};

export const getIngestionStatus = async (github_url: string) => {
  const response = await api.get('/agent/status', { params: { github_url } });
  return response.data;
};
