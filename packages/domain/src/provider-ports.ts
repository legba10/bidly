/**
 * Vendor-neutral contracts only. Implementations belong to infrastructure adapters and require
 * their own ADR, security/data-flow review, and dependency ledger entry.
 */
export interface ProviderRequestContext {
  readonly correlationId: string;
  readonly abortSignal?: AbortSignal;
}

export interface DeliveryReference {
  readonly providerReference: string;
  readonly acceptedAt: string;
}

export interface SmsMessage {
  readonly destination: string;
  readonly body: string;
}

export interface SmsProvider {
  send(message: SmsMessage, context: ProviderRequestContext): Promise<DeliveryReference>;
}

export interface EmailMessage {
  readonly destination: string;
  readonly subject: string;
  readonly plainTextBody: string;
  readonly htmlBody?: string;
}

export interface EmailProvider {
  send(message: EmailMessage, context: ProviderRequestContext): Promise<DeliveryReference>;
}

export interface MapPoint {
  readonly latitude: number;
  readonly longitude: number;
}

export interface MapProvider {
  geocode(query: string, context: ProviderRequestContext): Promise<readonly MapPoint[]>;
}

export interface PrivateObject {
  readonly objectKey: string;
  readonly contentType: string;
  readonly contentLength: bigint;
  readonly content: Uint8Array;
}

export interface SignedObjectAccess {
  readonly url: URL;
  readonly expiresAt: string;
}

export interface ObjectStorageProvider {
  putPrivateObject(object: PrivateObject, context: ProviderRequestContext): Promise<void>;
  createSignedReadAccess(
    objectKey: string,
    expiresAt: string,
    context: ProviderRequestContext,
  ): Promise<SignedObjectAccess>;
  deleteObject(objectKey: string, context: ProviderRequestContext): Promise<void>;
}

/**
 * Reserved port: the initial Bidly model does not process buyer payments. Methods must be designed
 * only after an explicit payment architecture and Russian-provider ADR is approved.
 */
export interface PaymentProvider {
  readonly capability: 'payment-provider-not-configured';
}

/**
 * Reserved port for future supplier-to-Bidly CPA/commission billing. No fictional invoice, charge,
 * or settlement operations are authorized during bootstrap.
 */
export interface BillingProvider {
  readonly capability: 'billing-provider-not-configured';
}
