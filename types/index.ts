

export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface AffectedAsset {
  id: string;
  name: string;
  type: string;
  owner: string;
  downstreamOf: string;
  serviceType?: string;
}

export interface AssetOwner {
  name: string;
  email: string;
  team: string;
}

export interface IncidentReport {
  id: string;
  assetName: string;
  assetType: string;
  failureReason: string;
  affectedAssets: AffectedAsset[];
  owners: AssetOwner[];
  report: string;
  timestamp: string;
  status: IncidentStatus;
  title?: string;
  description?: string;
}



export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface OnboardingContext {
  userName: string;
  role: string;
  team: string;
  conversationHistory: ChatMessage[];
}



export interface OpenMetadataAsset {
  id: string;
  name: string;
  fullyQualifiedName: string;
  type: string;
  description?: string;
  owner?: {
    name: string;
    type: string;
    id: string;
    displayName?: string;
  };
  owners?: Array<{
    name: string;
    type: string;
    id: string;
    displayName?: string;
  }>;
  tags?: { tagFQN: string }[];
  service?: {
    name: string;
    type: string;
  };
  columns?: {
    name: string;
    dataType: string;
    description?: string;
    tags?: { tagFQN: string }[];
  }[];
}

export interface LineageEdge {
  fromEntity: string;
  toEntity: string;
  fromId?: string;
  toId?: string;
}

export interface LineageNode extends OpenMetadataAsset {
  upstreamEdges: LineageEdge[];
  downstreamEdges: LineageEdge[];
}

export interface LineageResponse {
  entity: {
    id: string;
    name: string;
    type: string;
    fullyQualifiedName: string;
  };
  nodes: LineageNode[];
  upstreamEdges: LineageEdge[];
  downstreamEdges: LineageEdge[];
}

export interface DataQualityTestCase {
  id: string;
  name: string;
  description?: string;
  testDefinition: {
    name: string;
  };
  entityLink: string;
  testCaseResult?: {
    result: string;
    testCaseStatus: 'Success' | 'Failed' | 'Aborted';
    timestamp: number;
    failedRows?: number;
    passedRows?: number;
  };
}

export interface OpenMetadataUser {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  teams?: { name: string; id: string }[];
}

export interface OpenMetadataTeam {
  id: string;
  name: string;
  displayName?: string;
  users?: OpenMetadataUser[];
}

export interface OpenMetadataPipeline {
  id: string;
  name: string;
  fullyQualifiedName: string;
  description?: string;
  pipelineStatus?: {
    executionStatus: 'Successful' | 'Failed' | 'Pending';
    timestamp: number;
  };
  owner?: {
    name: string;
    id: string;
  };
}



export interface WebhookPayload {
  eventType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  entityFQN?: string;
  timestamp: string;
  changeDescription?: string;
  userName?: string;
}



export interface AgentIncidentInput {
  assetId: string;
  assetName: string;
  assetType: string;
  failureReason: string;
  timestamp: string;
}

export interface AgentOnboardingInput {
  userName: string;
  role: string;
  team: string;
  message: string;
  conversationHistory: ChatMessage[];
}

export interface WorkflowState {
  currentStep: 'identifying' | 'verifying' | 'remediating' | 'completed';
  completedSteps: string[];
}
