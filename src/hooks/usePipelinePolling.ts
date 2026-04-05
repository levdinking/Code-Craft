import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminApi } from './useAdminApi';
import type { PipelineJob } from '@/types/admin';

export function usePipelinePolling(jobId: string | null, interval = 2000) {
  const [job, setJob] = useState<PipelineJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get } = useAdminApi();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const data = await get<PipelineJob>(`/api/pipeline/jobs/${jobId}`);
      setJob(data);
      setError(null);
      // Останавливаем polling если задача завершена
      if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  }, [jobId, get]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setLoading(true);
    fetchJob().finally(() => setLoading(false));

    timerRef.current = setInterval(fetchJob, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [jobId, interval, fetchJob]);

  return { job, loading, error, refetch: fetchJob };
}
