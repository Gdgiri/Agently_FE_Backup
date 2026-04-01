
import { AITemplateResponse } from './schemaValidators';

export const transformAIToTemplate = (aiResponse: AITemplateResponse) => {
    // Detect variables like {{name}} or [customer_name] and convert to WhatsApp {{1}}, {{2}} format
    let body = aiResponse.body;
    const vars: string[] = [];

    // Simple regex to find words inside double curly braces or brackets
    const varRegex = /\{\{([^}]+)\}\}|\[([^\]]+)\]/g;
    let match;
    let index = 1;

    while ((match = varRegex.exec(body)) !== null) {
        const fullMatch = match[0];
        const varName = match[1] || match[2];

        if (!vars.includes(varName)) {
            vars.push(varName);
            // Replace all occurrences of this variable with {{index}}
            // Use a temporary placeholder to avoid double replacement if names are subsets
            const placeholder = `__VAR_TEMP_${index}__`;
            body = body.split(fullMatch).join(`{{${index}}}`);
            index++;
        }
    }

    return {
        ...aiResponse,
        body,
        variables: vars,
        preview: generatePreview(aiResponse)
    };
};

const generatePreview = (template: AITemplateResponse) => {
    // Mock a WhatsApp preview string
    let lines = [];
    if (template.header) lines.push(`[${template.header.type}] ${template.header.content}`);
    lines.push(template.body);
    if (template.footer) lines.push(template.footer);
    if (template.buttons) {
        template.buttons.forEach(b => lines.push(`[Button: ${b.text}]`));
    }
    return lines.join('\n\n');
};
