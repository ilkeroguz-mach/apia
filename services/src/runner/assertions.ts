import { StepExpectSchema } from '../catalog/schema';
import { extractJsonPath } from './resolver';
import { z } from 'zod';

export type StepExpect = z.infer<typeof StepExpectSchema>;

export interface AssertionResult {
  passed: boolean;
  message: string;
}

export function evaluateAssertions(expectations: StepExpect[] | undefined, responseStatus: number, responseBody: any): AssertionResult[] {
  if (!expectations || expectations.length === 0) return [];
  const results: AssertionResult[] = [];

  for (const exp of expectations) {
    if (exp.status !== undefined) {
      const passed = responseStatus === exp.status;
      results.push({
        passed,
        message: `Status code equals ${exp.status} (actual: ${responseStatus})`
      });
    }
    if (exp.jsonpath) {
      const val = extractJsonPath(responseBody, exp.jsonpath);
      if (exp.exists !== undefined) {
        const passed = exp.exists ? val !== undefined && val !== null : val === undefined || val === null;
        results.push({
          passed,
          message: `JSONPath '${exp.jsonpath}' exists (actual: ${JSON.stringify(val)})`
        });
      }
      if (exp.equals !== undefined) {
        const passed = val === exp.equals;
        results.push({
          passed,
          message: `JSONPath '${exp.jsonpath}' equals ${exp.equals} (actual: ${JSON.stringify(val)})`
        });
      }
    }
  }

  return results;
}
