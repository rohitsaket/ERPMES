import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { DiamondId, CertificateId } from '../value-objects/ids';

export class Certificate extends AggregateRoot {
  private _id: string;
  private _diamondId: string;
  private _labId: string;
  private _certificateNo: string;
  private _issueDate: Date;
  private _expiryDate: Date | null;
  private _pdfUrl: string | null;
  private _validatedAt: Date | null;
  private _validatedBy: string | null;
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    diamondId: string,
    labId: string,
    certificateNo: string,
    issueDate: Date,
    expiryDate: Date | null,
    pdfUrl: string | null
  ) {
    super();
    this._id = id;
    this._diamondId = diamondId;
    this._labId = labId;
    this._certificateNo = certificateNo;
    this._issueDate = issueDate;
    this._expiryDate = expiryDate;
    this._pdfUrl = pdfUrl;
  }

  static create(
    diamondId: string,
    labId: string,
    certificateNo: string,
    issueDate: Date,
    expiryDate: Date | null,
    pdfUrl: string | null
  ): any {
    const id = crypto.randomUUID();
    const cert = new Certificate(id, diamondId, labId, certificateNo, issueDate, expiryDate, pdfUrl);
    cert.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CertificateCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'Certificate',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { diamondId, certificateId: id },
      payload: { labId: labId, certificateNo, issueDate, expiryDate },
    });
    return cert;
  }

  static reconstruct(
    id: string,
    diamondId: string,
    labId: string,
    certificateNo: string,
    issueDate: Date,
    expiryDate: Date | null,
    pdfUrl: string | null,
    validatedAt: Date | null,
    validatedBy: string | null,
    deletedAt: Date | null
  ): any {
    const cert = new Certificate(id, diamondId, labId, certificateNo, issueDate, expiryDate, pdfUrl);
    cert._validatedAt = validatedAt;
    cert._validatedBy = validatedBy;
    cert._deletedAt = deletedAt;
    return cert;
  }

  get id(): string { return this._id; }
  get diamondId(): string { return this._diamondId; }
  get labId(): string { return this._labId; }
  get certificateNo(): string { return this._certificateNo; }
  get issueDate(): Date { return this._issueDate; }
  get expiryDate(): Date | null { return this._expiryDate; }
  get pdfUrl(): string | null { return this._pdfUrl; }
  get validatedAt(): Date | null { return this._validatedAt; }
  get validatedBy(): string | null { return this._validatedBy; }
  get deletedAt(): Date | null { return this._deletedAt; }

  validate(validatedBy: string): void {
    if (this._validatedAt) {
      throw new Error('Certificate already validated');
    }
    this._validatedAt = new Date();
    this._validatedBy = validatedBy;
    this.incrementVersion();
  }

  updatePdfUrl(pdfUrl: string): void {
    this._pdfUrl = pdfUrl;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}