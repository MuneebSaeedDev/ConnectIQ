/**
 * pipelineTest.api.js
 * API client and Figma-verified mock baseline for SCR-077: Pipeline Test Execution
 */

import { apiFetch, readJson } from '../../../services/api/client';

export const MOCK_TEST_PLAN = {
  pipelineId: 'pip_001',
  pipelineName: 'Customer 360 Ingestion Pipeline',
  version: '1.2.0',
  environment: 'Staging Sandbox',
  stages: [
    {
      id: 'stg_1',
      name: 'Source Extraction',
      nodeId: 'src_postgres_01',
      status: 'SUCCESS',
      recordsIn: 500,
      recordsOut: 500,
      durationMs: 420,
      logs: [
        'Connecting to PostgreSQL pool (staging)...',
        'Executing extraction cursor on table customers_raw...',
        'Sample dataset buffered: 500 rows.'
      ]
    },
    {
      id: 'stg_2',
      name: 'Active Customer Filter',
      nodeId: 'flt_active_01',
      status: 'SUCCESS',
      recordsIn: 500,
      recordsOut: 482,
      durationMs: 45,
      logs: [
        'Evaluating predicate status == ACTIVE...',
        '18 inactive customer rows filtered out.'
      ]
    },
    {
      id: 'stg_3',
      name: 'Schema Mapping & Casting',
      nodeId: 'map_fields_01',
      status: 'SUCCESS',
      recordsIn: 482,
      recordsOut: 482,
      durationMs: 80,
      logs: [
        'Mapping 12 fields to target schema...',
        'Casting customer_id to BIGINT.'
      ]
    },
    {
      id: 'stg_4',
      name: 'Data Quality Validator',
      nodeId: 'val_rules_01',
      status: 'SUCCESS',
      recordsIn: 482,
      recordsOut: 479,
      durationMs: 120,
      logs: [
        'Executing Great Expectations suite CustomerValidationSuite...',
        '3 records failed email regex constraint, routed to validation errors.'
      ]
    },
    {
      id: 'stg_5',
      name: 'Destination Staging Dry-Run',
      nodeId: 'dst_snowflake_01',
      status: 'SUCCESS',
      recordsIn: 479,
      recordsOut: 479,
      durationMs: 310,
      logs: [
        'Staging Parquet batch to s3://connectiq-stage-test/tmp_479.parquet...',
        'Verifying Snowflake target schema FACT_CUSTOMER_ORDERS...',
        'Table schema validated. Simulation successful.'
      ]
    }
  ],
  summary: {
    totalRecordsTested: 500,
    successfulRecords: 479,
    filteredRecords: 18,
    failedValidation: 3,
    totalDurationMs: 975,
    status: 'PASSED'
  }
};

export async function executePipelineTest(pipelineId, sampleSize = 500, mockInputs = true) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/test-execution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleSize, mockInputs })
    });
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.data) return data.data;
    }
  } catch (e) {
    console.info('[PipelineTest] Mock fallback:', e.message);
  }
  return MOCK_TEST_PLAN;
}
