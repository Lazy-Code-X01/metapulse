import axios, { AxiosInstance } from 'axios';
import {
  OpenMetadataAsset,
  LineageResponse,
  DataQualityTestCase,
  OpenMetadataUser,
  OpenMetadataTeam,
  OpenMetadataPipeline,
} from '@/types';



export interface OMConfig {
  baseURL?: string;
  token?: string;
}

const createClient = (config?: OMConfig): AxiosInstance => {
  const rawUrl = config?.baseURL || process.env.OPENMETADATA_BASE_URL || '';
  const token = config?.token || process.env.OPENMETADATA_PAT;

  const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  const baseURL = cleanUrl.includes('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;

  if (!baseURL || !token) {
    throw new Error('Missing OpenMetadata credentials. Please complete onboarding.');
  }

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
};



export const searchAssets = async (
  query: string,
  index: string = 'table_search_index',
  limit: number = 10,
  config?: OMConfig
): Promise<OpenMetadataAsset[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/search/query', {
      params: {
        q: query,
        index,
        from: 0,
        size: limit,
        fields: 'owner,description'
      },
    });
    const hits = response.data?.hits?.hits ?? [];
    return hits.map((hit: { _source: OpenMetadataAsset }) => hit._source);
  } catch (error) {
    console.error('[OpenMetadata] searchAssets failed:', error);
    return [];
  }
};

export const searchAllAssets = async (
  query: string,
  limit: number = 10,
  config?: OMConfig
): Promise<OpenMetadataAsset[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/search/query', {
      params: {
        q: query,
        index: 'all',
        from: 0,
        size: limit,
        fields: 'owner,description'
      },
    });
    const hits = response.data?.hits?.hits ?? [];
    if (hits.length === 0) {
      return listTables(limit, config);
    }
    return hits.map((hit: { _source: OpenMetadataAsset }) => hit._source);
  } catch (error) {
    console.error('[OpenMetadata] searchAllAssets failed:', error);
    return listTables(limit, config);
  }
};



export const getTableById = async (id: string, config?: OMConfig): Promise<OpenMetadataAsset | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/tables/${id}`, {
      params: { fields: 'owner,description,columns' }
    });
    return response.data as OpenMetadataAsset;
  } catch (error) {
    console.error(`[OpenMetadata] getTableById failed for id ${id}:`, error);
    return null;
  }
};

export const listTables = async (limit: number = 20, config?: OMConfig): Promise<OpenMetadataAsset[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/tables', {
      params: { limit, include: 'all', fields: 'owner,description' },
    });
    return (response.data?.data ?? []) as OpenMetadataAsset[];
  } catch (error) {
    console.error('[OpenMetadata] listTables failed:', error);
    return [];
  }
};



export const getLineage = async (
  entityType: string,
  id: string,
  upstreamDepth: number = 2,
  downstreamDepth: number = 2,
  config?: OMConfig
): Promise<LineageResponse | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/lineage/${entityType}/${id}`, {
      params: { upstreamDepth, downstreamDepth },
    });
    return response.data as LineageResponse;
  } catch (error) {
    console.error(`[OpenMetadata] getLineage failed for ${entityType}/${id}:`, error);
    return null;
  }
};

export const getLineageByFQN = async (
  entityType: string,
  fqn: string,
  upstreamDepth: number = 2,
  downstreamDepth: number = 2,
  config?: OMConfig
): Promise<LineageResponse | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/lineage/${entityType}/name/${fqn}`, {
      params: { upstreamDepth, downstreamDepth },
    });
    return response.data as LineageResponse;
  } catch (error) {
    console.error(`[OpenMetadata] getLineageByFQN failed for ${fqn}:`, error);
    return null;
  }
};



export const getTestCasesForAsset = async (entityFQN: string, config?: OMConfig): Promise<DataQualityTestCase[]> => {
  try {
    const client = createClient(config);
    const entityLink = `<#E::table::${entityFQN}>`;
    const response = await client.get('/dataQuality/testCases', {
      params: {
        entityLink,
        limit: 50,
        include: 'all',
      },
    });
    return (response.data?.data ?? []) as DataQualityTestCase[];
  } catch (error) {
    console.error(`[OpenMetadata] getTestCasesForAsset failed for ${entityFQN}:`, error);
    return [];
  }
};

export const getFailedTestCases = async (entityFQN: string, config?: OMConfig): Promise<DataQualityTestCase[]> => {
  const allTests = await getTestCasesForAsset(entityFQN, config);
  return allTests.filter((t) => t.testCaseResult?.testCaseStatus === 'Failed');
};



export const listTeams = async (config?: OMConfig): Promise<OpenMetadataTeam[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/teams', {
      params: { limit: 50, include: 'all' },
    });
    return (response.data?.data ?? []) as OpenMetadataTeam[];
  } catch (error) {
    console.error('[OpenMetadata] listTeams failed:', error);
    return [];
  }
};

export const getTeamByName = async (teamName: string, config?: OMConfig): Promise<OpenMetadataTeam | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/teams/name/${teamName}`, {
      params: { include: 'all' },
    });
    return response.data as OpenMetadataTeam;
  } catch (error) {
    console.error(`[OpenMetadata] getTeamByName failed for ${teamName}:`, error);
    return null;
  }
};

export const getUsersByTeam = async (teamName: string, config?: OMConfig): Promise<OpenMetadataUser[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/users', {
      params: { team: teamName, limit: 50, include: 'all' },
    });
    return (response.data?.data ?? []) as OpenMetadataUser[];
  } catch (error) {
    console.error(`[OpenMetadata] getUsersByTeam failed for ${teamName}:`, error);
    return [];
  }
};

export const getUserById = async (id: string, config?: OMConfig): Promise<OpenMetadataUser | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/users/${id}`);
    return response.data as OpenMetadataUser;
  } catch (error) {
    console.error(`[OpenMetadata] getUserById failed for ${id}:`, error);
    return null;
  }
};

export const getPipelineById = async (id: string, config?: OMConfig): Promise<OpenMetadataPipeline | null> => {
  try {
    const client = createClient(config);
    const response = await client.get(`/pipelines/${id}`);
    return response.data as OpenMetadataPipeline;
  } catch (error) {
    console.error(`[OpenMetadata] getPipelineById failed for ${id}:`, error);
    return null;
  }
};

export const listPipelines = async (limit: number = 20, config?: OMConfig): Promise<OpenMetadataPipeline[]> => {
  try {
    const client = createClient(config);
    const response = await client.get('/pipelines', {
      params: { limit, include: 'all' },
    });
    return (response.data?.data ?? []) as OpenMetadataPipeline[];
  } catch (error) {
    console.error('[OpenMetadata] listPipelines failed:', error);
    return [];
  }
};



export const pingOpenMetadata = async (config?: { baseURL?: string; token?: string }): Promise<boolean> => {
  try {
    const client = createClient(config)
    await client.get('/tables?limit=1')
    return true
  } catch (error) {
    console.error('[OpenMetadata] ping failed:', error)
    return false
  }
}

