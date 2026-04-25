import {
  AgentIncidentInput,
  AgentOnboardingInput,
  IncidentReport,
  AffectedAsset,
  AssetOwner,
} from '@/types';
import {
  getLineage,
  getTestCasesForAsset,
  searchAllAssets,
  getUsersByTeam,
  getTableById,
} from '@/lib/openmetadata';
import {
  generateIncidentReport,
  generateOnboardingResponse,
} from '@/lib/claude';
import { sendSlackIncidentAlert } from '@/lib/notify';

export async function runIncidentAgent(input: AgentIncidentInput): Promise<IncidentReport> {
  try {
    // 1. Get lineage data
    const lineage = await getLineage(input.assetType, input.assetId);

    const tableDetails = await getTableById(input.assetId)
    const tableOwner = tableDetails?.owner?.name || 'Unknown'

    // 2. Get quality failures
    const testCases = await getTestCasesForAsset(input.assetName);
    const failedTests = testCases
      .filter((tc) => tc.testCaseResult?.testCaseStatus === 'Failed')
      .map((tc) => tc.name);

    // 3 & 4. Extract downstream affected assets and owners
    const downstreamImpact: string[] = [];
    const affectedAssets: AffectedAsset[] = [];
    const affectedOwnersSet = new Set<string>();

    if (lineage?.downstreamEdges && lineage?.nodes) {
      const downstreamIds = lineage.downstreamEdges.map((e) => e.toEntity);
      const downstreamNodes = lineage.nodes.filter((n) => downstreamIds.includes(n.id));

      for (const node of downstreamNodes) {
        downstreamImpact.push(node.name);
        try {
          const details = await getTableById(node.id)
          const ownerName = details?.owner?.name || 'Unknown'
          
          if (ownerName !== 'Unknown') {
            affectedOwnersSet.add(ownerName)
          }
          
          affectedAssets.push({
            id: node.id,
            name: node.name,
            type: node.type,
            owner: ownerName,
            downstreamOf: input.assetName,
          })
        } catch {
          affectedAssets.push({
            id: node.id,
            name: node.name,
            type: node.type,
            owner: 'Unknown',
            downstreamOf: input.assetName,
          })
        }
      }
    }

    const affectedOwners = Array.from(affectedOwnersSet);

    // 5. Build IncidentContext object
    const incidentContext = {
      whatBroke: input.assetName,
      failureReason: input.failureReason,
      downstreamImpact,
      affectedOwners: tableOwner !== 'Unknown'
        ? [tableOwner, ...affectedOwners]
        : affectedOwners,
      failedTests,
      tableOwner,
      reportedAt: new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
    };

    // 6. Call Claude to generate the report
    const generatedReport = await generateIncidentReport(incidentContext);

    const owners: AssetOwner[] = tableOwner !== 'Unknown'
      ? [{ 
          name: tableOwner, 
          email: `${tableOwner}@company.com`, 
          team: 'Data Engineering' 
        }]
      : []

    // 7. Build and return complete IncidentReport
    const incidentReport: IncidentReport = {
      id: Date.now().toString(),
      status: 'open',
      timestamp: new Date().toISOString(),
      assetName: input.assetName,
      failureReason: input.failureReason,
      affectedAssets,
      owners,
      report: generatedReport,
    };

    await sendSlackIncidentAlert(incidentReport);

    return incidentReport;
  } catch (error) {
    console.error('[Agent] Error in runIncidentAgent:', error);
    throw error;
  }
}

export async function runOnboardingAgent(input: AgentOnboardingInput): Promise<string> {
  try {
    // 1. Find relevant assets based on role
    const assets = await searchAllAssets(input.role);

    // 2. Find teammates
    const users = await getUsersByTeam(input.team);

    // 3. Build context with Team members found
    const teamMembers = users.map((u) => `${u.name} (${u.email})`).join(', ');
    
    const userContext = {
      userName: input.userName,
      role: input.role,
      team: input.team,
      teamMembersData: teamMembers, 
    };

    // 4 & 5. Call Claude and return response
    const enrichedAssets = await Promise.all(
      assets.slice(0, 5).map(async (asset) => {
        try {
          const details = await getTableById(asset.id)
          return {
            ...asset,
            owner: details?.owner || { name: 'Unknown', type: 'user', id: '0' },
            description: details?.description 
              || asset.description 
              || 'No description available',
            columns: details?.columns || []
          }
        } catch {
          return { ...asset }
        }
      })
    )

    const response = await generateOnboardingResponse(
      userContext,
      input.message,
      input.conversationHistory,
      enrichedAssets
    );

    return response;
  } catch (error) {
    console.error('[Agent] Error in runOnboardingAgent:', error);
    throw error;
  }
}
