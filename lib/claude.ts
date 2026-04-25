import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, OpenMetadataAsset } from '@/types';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface IncidentContext {
  whatBroke: string;
  failureReason?: string;
  downstreamImpact?: string[];
  affectedOwners?: string[];
  tableOwner?: string;
  reportedAt?: string;
}

export interface UserContext {
  userName: string;
  role: string;
  team: string;
  teamMembersData?: string;
}

/**
 * Generates a structured incident report.
 */
export async function generateIncidentReport(incidentContext: IncidentContext): Promise<string> {
  const systemPrompt = `You are a senior data engineer writing a real-time incident report.

STRICT RULES — follow every one:
1. Use ONLY data from the JSON context provided. Never invent IDs, names, or dates.
2. The "reportedAt" field in the context IS the real incident timestamp — use it verbatim. Never write [Current Date/Time] or [TBD].
3. Do NOT use checkbox syntax like "[ ]" or "- [ ]". Use plain "- " bullet points for all lists.
4. Keep the report concise — under 350 words.
5. Sections to include (use ## headers):
   ## Summary
   ## What Broke
   ## Downstream Impact
   ## Affected Owner
   ## Immediate Actions
   ## Next Steps
6. For "Affected Owner" write the owner name directly from tableOwner in the context.`;

  const now = incidentContext.reportedAt || new Date().toLocaleString('en-GB', {
    dateStyle: 'medium', timeStyle: 'short'
  });

  const userMessage = `Generate an incident report for this event:

Reported at: ${now}
Table owner: ${incidentContext.tableOwner || 'Unknown'}

Full context:
${JSON.stringify(incidentContext, null, 2)}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 900,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    if (msg.content[0].type === 'text') {
      return msg.content[0].text;
    }
    return '';
  } catch (error) {
    console.error('[Claude] Failed to generate incident report:', error);
    throw new Error(`Claude API error: ${String(error)}`);
  }
}

/**
 * Generates a conversational response for onboarding.
 */
export async function generateOnboardingResponse(
  userContext: UserContext,
  message: string,
  history: ChatMessage[],
  catalogAssets: OpenMetadataAsset[]
): Promise<string> {
  const systemPrompt = `Act as a friendly senior data engineer onboarding a new teammate.
Use the catalog data provided to give personalized guidance.
Explain what tables are most relevant to their role.
Mention key people they should know.
Be conversational and welcoming.
Keep responses focused and not overwhelming.

You have been given real live data from the 
OpenMetadata catalog. Always use this data in 
your responses. When asked about table owners, 
always state the owner name explicitly from the 
catalog data provided. Never say you don't have 
access to catalog information.`;

  const assetContext = catalogAssets.length > 0
    ? catalogAssets.map((a: OpenMetadataAsset) => 
        `Table: ${a.name}
       Owner: ${a.owner?.name || 'Unknown'}
       Description: ${a.description || 'No description'}
       Columns: ${a.columns?.map(c => c.name).join(', ') || 'N/A'}`
      ).join('\n\n')
    : 'No catalog assets found for this role.';

  // Convert ChatMessage history to Anthropic message format
  const formattedHistory: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const teamContext = userContext.teamMembersData || 'No team members provided';
  const finalMessage = `User context:
Name: ${userContext.userName}
Role: ${userContext.role}  
Team: ${userContext.team}

Catalog data for their role:
${assetContext}

Team members:
${teamContext}

User message: ${message}`;

  // Append the current message
  formattedHistory.push({
    role: 'user',
    content: finalMessage,
  });

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedHistory,
    });

    if (msg.content[0].type === 'text') {
      return msg.content[0].text;
    }
    return '';
  } catch (error) {
    console.error('[Claude] Failed to generate onboarding response:', error);
    throw new Error(`Claude API error: ${String(error)}`);
  }
}
