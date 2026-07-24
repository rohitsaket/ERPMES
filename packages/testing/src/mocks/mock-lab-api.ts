export const mockLabApi = {
  submitCertificate: vi.fn().mockResolvedValue({
    trackingNo: 'TRK_' + Math.random().toString(36).substr(2, 10),
    status: 'SUBMITTED',
    estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  getCertificateStatus: vi.fn().mockResolvedValue({
    status: 'PENDING',
    trackingNo: 'TRK_123',
  }),
  getCertificate: vi.fn().mockResolvedValue({
    certificateNo: 'CERT_123456',
    diamondId: 'diamond_1',
    carat: 1.05,
    color: 'E',
    clarity: 'VVS1',
    cut: 'EXCELLENT',
    shape: 'ROUND',
    measurements: { length: 6.5, width: 6.5, depth: 4.0 },
    fluorescence: 'NONE',
    polish: 'EXCELLENT',
    symmetry: 'EXCELLENT',
    issueDate: new Date().toISOString(),
    pdfUrl: 'https://lab.example.com/certificates/CERT_123456.pdf',
  }),
  downloadCertificate: vi.fn().mockResolvedValue(Buffer.from('mock pdf content')),
  validateCertificate: vi.fn().mockResolvedValue({
    valid: true,
    labId: 'GIA',
    certificateNo: 'CERT_123456',
  }),
  listPendingCertificates: vi.fn().mockResolvedValue([
    { certificateId: 'cert_1', diamondId: 'diamond_1', labId: 'GIA', submittedAt: new Date().toISOString() },
    { certificateId: 'cert_2', diamondId: 'diamond_2', labId: 'IGI', submittedAt: new Date().toISOString() },
  ]),
} as any;

export const createMockLabSubmission = (overrides: Partial<any> = {}) => ({
  trackingNo: 'TRK_' + Math.random().toString(36).substr(2, 10),
  status: 'SUBMITTED',
  estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

export const createMockCertificate = (overrides: Partial<any> = {}) => ({
  certificateNo: 'CERT_' + Math.random().toString(36).substr(2, 8).toUpperCase(),
  diamondId: 'diamond_' + Math.random().toString(36).substr(2, 8),
  carat: 1.0,
  color: 'E',
  clarity: 'VVS1',
  cut: 'EXCELLENT',
  shape: 'ROUND',
  measurements: { length: 6.5, width: 6.5, depth: 4.0 },
  fluorescence: 'NONE',
  polish: 'EXCELLENT',
  symmetry: 'EXCELLENT',
  issueDate: new Date().toISOString(),
  pdfUrl: 'https://lab.example.com/certificates/CERT_123456.pdf',
  ...overrides,
});
