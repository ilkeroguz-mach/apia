"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAssertions = evaluateAssertions;
const resolver_1 = require("./resolver");
function evaluateAssertions(expectations, responseStatus, responseBody) {
    if (!expectations || expectations.length === 0)
        return [];
    const results = [];
    for (const exp of expectations) {
        if (exp.status !== undefined) {
            const passed = responseStatus === exp.status;
            results.push({
                passed,
                message: `Status code equals ${exp.status} (actual: ${responseStatus})`
            });
        }
        if (exp.jsonpath) {
            const val = (0, resolver_1.extractJsonPath)(responseBody, exp.jsonpath);
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
