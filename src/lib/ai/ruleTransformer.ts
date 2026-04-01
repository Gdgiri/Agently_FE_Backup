
import { AIRuleResponse } from './schemaValidators';

export const transformAIToRule = (aiResponse: AIRuleResponse) => {
    // Map AI-generated rule to application rule format
    // MOCK_RULES currently looks like: { id: 'r1', trigger: 'Keyword', value: 'PROPERTY', action: 'Add Tag', target: 'Prospect', status: 'Active' }

    return {
        trigger: aiResponse.trigger === 'INBOUND_MESSAGE' ? 'Keyword' : aiResponse.trigger.replace('_', ' '),
        value: aiResponse.condition?.value || 'ANY',
        action: aiResponse.actions[0]?.type || 'No Action',
        target: aiResponse.actions[0]?.value || 'N/A',
        status: 'Draft',
        aiGenerated: true,
        originalAIResponse: aiResponse
    };
};
