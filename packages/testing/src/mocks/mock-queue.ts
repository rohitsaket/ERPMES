import { Queue } from 'bullmq';

export const mockQueue = {
  add: vi.fn().mockResolvedValue({ id: 'job_1', data: {} }),
  addBulk: vi.fn().mockResolvedValue([{ id: 'job_1' }, { id: 'job_2' }]),
  getJob: vi.fn().mockResolvedValue(null),
  getJobs: vi.fn().mockResolvedValue([]),
  getWaiting: vi.fn().mockResolvedValue([]),
  getActive: vi.fn().mockResolvedValue([]),
  getCompleted: vi.fn().mockResolvedValue([]),
  getFailed: vi.fn().mockResolvedValue([]),
  getDelayed: vi.fn().mockResolvedValue([]),
  getPaused: vi.fn().mockResolvedValue(false),
  pause: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  drain: vi.fn().mockResolvedValue(undefined),
  clean: vi.fn().mockResolvedValue([]),
  getJobCounts: vi.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }),
  getRepeatableJobs: vi.fn().mockResolvedValue([]),
  addRepeatable: vi.fn(),
  removeRepeatable: vi.fn(),
  getMetrics: vi.fn().mockResolvedValue({}),
  isPaused: vi.fn().mockResolvedValue(false),
  getJobLogs: vi.fn().mockResolvedValue({ logs: [], count: 0 }),
  getJobLog: vi.fn().mockResolvedValue({ log: '' }),
} as unknown as Queue;

export const mockQueueScheduler = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  add: vi.fn(),
  remove: vi.fn(),
};