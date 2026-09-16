import { useState } from 'react';
import { executePipelineTest, MOCK_TEST_PLAN } from '../services/pipelineTest.api';

export function usePipelineTest(pipelineId = 'pip_001') {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(MOCK_TEST_PLAN);
  const [selectedStage, setSelectedStage] = useState(MOCK_TEST_PLAN.stages[0]);
  const [sampleSize, setSampleSize] = useState(500);
  const [mockInputs, setMockInputs] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const data = await executePipelineTest(pipelineId, sampleSize, mockInputs);
      setTestResults(data);
      if (data.stages && data.stages.length > 0) {
        setSelectedStage(data.stages[0]);
      }
      setActionFeedback({
        type: 'success',
        message: `Pipeline dry-run completed successfully with ${data.summary.totalRecordsTested} sample records.`,
      });
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Pipeline test run encountered an error.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    testResults,
    selectedStage,
    setSelectedStage,
    sampleSize,
    setSampleSize,
    mockInputs,
    setMockInputs,
    isRunning,
    handleRunTest,
    actionFeedback,
  };
}
