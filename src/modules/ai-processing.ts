import 'openai/shims/web';

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import {
  EXTRACT_IMAGES_PROMPT,
  FORMAT_DATA_INTO_JSON_PROMPT,
} from './config/prompts';
import { Customer, customerSchema } from '../types/Customer';
import { CompletionUsage } from 'openai/resources';
import { completion } from 'zod-gpt';
import { z } from 'zod';
import { OpenAIChatApi } from 'llm-api';

export type Usage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

function usageOrDefault(usage?: CompletionUsage): Usage {
  return {
    promptTokens: usage?.prompt_tokens || 0,
    completionTokens: usage?.completion_tokens || 0,
    totalTokens: usage?.total_tokens || 0,
  };
}

function getBase64FromImageFile(filePath: string): string {
  const base64Image = readFileSync(filePath, 'base64');

  return base64Image;
}

export async function extractDataFromImageFile(
  filePath: string,
  onlyWithOk?: boolean
): Promise<{
  data: string;
  usage: Usage;
}> {
  const imageExtension = filePath.split('.').pop();

  const base64Image = getBase64FromImageFile(filePath);

  const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openAi.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: EXTRACT_IMAGES_PROMPT.replace(
              '{only_with_ok}',
              onlyWithOk
                ? 'Extraia apenas as linhas que não tiverem o "OK" do lado em caneta azul.'
                : ''
            ),
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/${imageExtension};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  const usage = completion.usage;

  return {
    data: completion.choices[0].message.content || 'No Data Available',
    usage: usageOrDefault(usage),
  };
}

export async function processExtractedDataIntoCustomerJSON(
  data: string
): Promise<{
  data: Customer[];
  usage: Usage;
}> {
  const openAi = new OpenAIChatApi(
    {
      apiKey: process.env.OPENAI_API_KEY,
    },
    {
      model: 'gpt-4o',
    }
  );

  const generatedCompletion = await completion(
    openAi,
    FORMAT_DATA_INTO_JSON_PROMPT.replace('{extract_data}', data),
    {
      schema: z.object({
        customers: z.array(customerSchema),
      }),
    }
  );

  return {
    data: generatedCompletion.data.customers,
    usage: {
      promptTokens: generatedCompletion.usage?.promptTokens || 0,
      completionTokens: generatedCompletion.usage?.completionTokens || 0,
      totalTokens: generatedCompletion.usage?.totalTokens || 0,
    },
  };
}
