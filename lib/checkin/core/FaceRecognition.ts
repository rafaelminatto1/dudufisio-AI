import {
  PatientId,
  FaceRecognitionConfig,
  EnrollmentResult,
  RecognitionResult,
  FaceMatch
} from '../../../types/checkin';
import { AWSRekognitionAdapter, createAWSRekognition } from '../adapters/AWSRekognitionAdapter';

interface FaceAPI {
  detectFaces(imageData: ImageData): Promise<DetectedFace[]>;
  getFaceEncoding(face: DetectedFace): Promise<Float32Array>;
}

interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number };
  landmarks: { x: number; y: number }[];
  confidence: number;
}

export class EnrollmentResultImpl implements EnrollmentResult {
  constructor(
    public success: boolean,
    public patientId?: PatientId,
    public qualityScore?: number,
    public enrolledAt?: Date,
    public error?: string
  ) {}

  static success(data: { patientId: PatientId; qualityScore: number; enrolledAt: Date }): EnrollmentResult {
    return new EnrollmentResultImpl(true, data.patientId, data.qualityScore, data.enrolledAt);
  }

  static failure(error: string): EnrollmentResult {
    return new EnrollmentResultImpl(false, undefined, undefined, undefined, error);
  }
}

export class RecognitionResultImpl implements RecognitionResult {
  constructor(
    public type: 'success' | 'no_face' | 'no_match' | 'low_confidence' | 'error',
    public patientId?: PatientId,
    public confidence?: number,
    public matches?: FaceMatch[],
    public error?: string
  ) {}

  isSuccess(): boolean {
    return this.type === 'success';
  }

  static success(match: FaceMatch): RecognitionResult {
    return new RecognitionResultImpl('success', match.patientId, match.confidence);
  }

  static noFaceDetected(): RecognitionResult {
    return new RecognitionResultImpl('no_face');
  }

  static noMatch(): RecognitionResult {
    return new RecognitionResultImpl('no_match');
  }

  static lowConfidence(match: FaceMatch): RecognitionResult {
    return new RecognitionResultImpl('low_confidence', match.patientId, match.confidence);
  }

  static error(error: string): RecognitionResult {
    return new RecognitionResultImpl('error', undefined, undefined, undefined, error);
  }
}

export class FaceMatchImpl implements FaceMatch {
  constructor(
    public patientId: PatientId,
    public confidence: number
  ) {}
}

class MockFaceAPI implements FaceAPI {
  async detectFaces(imageData: ImageData): Promise<DetectedFace[]> {
    // Mock implementation - in production, this would use a real face detection API
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time

    // Simulate finding a face with 90% probability
    if (Math.random() > 0.1) {
      return [{
        boundingBox: { x: 100, y: 100, width: 200, height: 200 },
        landmarks: [
          { x: 150, y: 150 }, // left eye
          { x: 250, y: 150 }, // right eye
          { x: 200, y: 200 }, // nose
          { x: 200, y: 250 }  // mouth
        ],
        confidence: 0.95
      }];
    }

    return [];
  }

  async getFaceEncoding(face: DetectedFace): Promise<Float32Array> {
    // Mock implementation - in production, this would extract real face encodings
    await new Promise(resolve => setTimeout(resolve, 50));

    // Generate a mock face encoding (128 dimensions is common)
    const encoding = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      encoding[i] = Math.random() * 2 - 1; // Random values between -1 and 1
    }

    return encoding;
  }
}

export class FaceRecognitionService {
  private faceApi: FaceAPI;
  private awsRekognition: AWSRekognitionAdapter | null;
  private encodingCache = new Map<string, Float32Array>();
  private confidenceThreshold: number;
  private useAWS: boolean;

  constructor(config: FaceRecognitionConfig) {
    // Try to initialize AWS Rekognition first
    this.awsRekognition = createAWSRekognition();
    this.useAWS = !!this.awsRekognition;

    if (this.useAWS) {
      console.log('✅ Using AWS Rekognition for face recognition');
    } else {
      console.log('⚠️ AWS credentials not found, using mock face recognition');
    }

    // Fallback to mock API if AWS not available
    this.faceApi = new MockFaceAPI();
    this.confidenceThreshold = config.confidenceThreshold;
  }

  async enrollPatient(patientId: PatientId, photoData: ImageData): Promise<EnrollmentResult> {
    try {
      // Use AWS Rekognition if available
      if (this.useAWS && this.awsRekognition) {
        console.log(`🔍 Enrolling patient ${patientId} with AWS Rekognition...`);

        const result = await this.awsRekognition.enrollPatient(patientId, photoData);

        if (result.success) {
          return EnrollmentResultImpl.success({
            patientId,
            qualityScore: result.qualityScore || 0.9,
            enrolledAt: new Date()
          });
        } else {
          return EnrollmentResultImpl.failure(result.error || 'AWS enrollment failed');
        }
      }

      // Fallback to mock implementation
      console.log(`🔍 Enrolling patient ${patientId} with mock face recognition...`);

      const faces = await this.faceApi.detectFaces(photoData);
      if (faces.length === 0) {
        return EnrollmentResultImpl.failure('No face detected in image');
      }

      if (faces.length > 1) {
        return EnrollmentResultImpl.failure('Multiple faces detected');
      }

      // Extract face encoding
      const faceEncoding = await this.faceApi.getFaceEncoding(faces[0]);

      // Validate image quality
      const qualityScore = await this.assessImageQuality(photoData, faces[0]);
      if (qualityScore < 0.7) {
        return EnrollmentResultImpl.failure('Image quality too low');
      }

      // Store encoding securely
      await this.storeFaceEncoding(patientId, faceEncoding);

      // Cache locally for performance
      this.encodingCache.set(patientId, faceEncoding);

      return EnrollmentResultImpl.success({
        patientId,
        qualityScore,
        enrolledAt: new Date()
      });
    } catch (error) {
      return EnrollmentResultImpl.failure(`Enrollment failed: ${error}`);
    }
  }

  async recognizePatient(photoData: ImageData): Promise<RecognitionResult> {
    try {
      // Use AWS Rekognition if available
      if (this.useAWS && this.awsRekognition) {
        console.log(`🔍 Searching patient with AWS Rekognition...`);

        const result = await this.awsRekognition.searchPatient(photoData);

        if (result.success && result.patientId) {
          const match = new FaceMatchImpl(result.patientId, result.confidence || 0.9);
          return RecognitionResultImpl.success(match);
        } else if (result.error?.includes('Nenhum paciente encontrado')) {
          return RecognitionResultImpl.noMatch();
        } else {
          return RecognitionResultImpl.error(result.error || 'AWS search failed');
        }
      }

      // Fallback to mock implementation
      console.log(`🔍 Searching patient with mock face recognition...`);

      const faces = await this.faceApi.detectFaces(photoData);
      if (faces.length === 0) {
        return RecognitionResultImpl.noFaceDetected();
      }

      // Extract encoding
      const unknownEncoding = await this.faceApi.getFaceEncoding(faces[0]);

      // Compare with known encodings
      const matches = await this.findMatches(unknownEncoding);

      if (matches.length === 0) {
        return RecognitionResultImpl.noMatch();
      }

      // Return best match
      const bestMatch = matches.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      if (bestMatch.confidence < this.confidenceThreshold) {
        return RecognitionResultImpl.lowConfidence(bestMatch);
      }

      return RecognitionResultImpl.success(bestMatch);
    } catch (error) {
      return RecognitionResultImpl.error(`Recognition failed: ${error}`);
    }
  }

  private async findMatches(unknownEncoding: Float32Array): Promise<FaceMatch[]> {
    const matches: FaceMatch[] = [];

    // Search in cache first (recent patients)
    for (const [patientId, knownEncoding] of this.encodingCache) {
      const distance = this.calculateEuclideanDistance(unknownEncoding, knownEncoding);
      const confidence = Math.max(0, 1 - (distance / 2)); // Normalize to 0-1

      if (confidence > 0.6) {
        matches.push(new FaceMatchImpl(patientId as PatientId, confidence));
      }
    }

    // If not found in cache, search in database
    if (matches.length === 0) {
      const dbMatches = await this.searchInDatabase(unknownEncoding);
      matches.push(...dbMatches);
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateEuclideanDistance(encoding1: Float32Array, encoding2: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < encoding1.length; i++) {
      const diff = encoding1[i] - encoding2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  private async assessImageQuality(imageData: ImageData, face: DetectedFace): Promise<number> {
    // Mock quality assessment - in production, this would analyze:
    // - Image resolution and clarity
    // - Face angle and pose
    // - Lighting conditions
    // - Motion blur
    await new Promise(resolve => setTimeout(resolve, 50));

    let quality = 0.8; // Base quality

    // Adjust based on face confidence
    quality *= face.confidence;

    // Adjust based on face size (larger faces = better quality)
    const faceArea = face.boundingBox.width * face.boundingBox.height;
    const imageArea = imageData.width * imageData.height;
    const faceRatio = faceArea / imageArea;

    if (faceRatio < 0.1) quality *= 0.7; // Face too small
    else if (faceRatio > 0.5) quality *= 1.1; // Good face size

    return Math.min(quality, 1.0);
  }

  private async storeFaceEncoding(patientId: PatientId, encoding: Float32Array): Promise<void> {
    // Mock storage - in production, this would encrypt and store in secure database
    await new Promise(resolve => setTimeout(resolve, 100));

    // Store in cache for immediate use
    this.encodingCache.set(patientId, encoding);

    console.log(`Face encoding stored for patient ${patientId}`);
  }

  private async searchInDatabase(unknownEncoding: Float32Array): Promise<FaceMatch[]> {
    // Mock database search - in production, this would query the encrypted face encodings
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockMatches: FaceMatch[] = [];

    // Simulate finding some matches in database
    const mockPatientIds = ['patient-1', 'patient-2', 'patient-3'];
    for (const patientId of mockPatientIds) {
      if (Math.random() > 0.7) { // 30% chance of match
        const confidence = 0.5 + Math.random() * 0.4; // Random confidence between 0.5-0.9
        mockMatches.push(new FaceMatchImpl(patientId as PatientId, confidence));
      }
    }

    return mockMatches;
  }

  async preloadEncodings(patientIds: PatientId[]): Promise<void> {
    // Preload frequently accessed patient encodings into cache
    for (const patientId of patientIds) {
      if (!this.encodingCache.has(patientId)) {
        const encoding = await this.loadEncodingFromDatabase(patientId);
        if (encoding) {
          this.encodingCache.set(patientId, encoding);
        }
      }
    }
  }

  private async loadEncodingFromDatabase(patientId: PatientId): Promise<Float32Array | null> {
    // Mock database loading
    await new Promise(resolve => setTimeout(resolve, 50));

    // Return mock encoding
    const encoding = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      encoding[i] = Math.random() * 2 - 1;
    }

    return encoding;
  }

  clearCache(): void {
    this.encodingCache.clear();
  }

  getCacheSize(): number {
    return this.encodingCache.size;
  }

  /**
   * Get face recognition statistics
   */
  async getStats(): Promise<{
    provider: 'AWS_REKOGNITION' | 'MOCK';
    cacheSize: number;
    awsCollectionStats?: {
      faceCount: number;
      collectionId: string;
      createdAt?: Date;
    };
  }> {
    const stats = {
      provider: this.useAWS ? 'AWS_REKOGNITION' as const : 'MOCK' as const,
      cacheSize: this.encodingCache.size
    };

    if (this.useAWS && this.awsRekognition) {
      try {
        const awsStats = await this.awsRekognition.getCollectionStats();
        return {
          ...stats,
          awsCollectionStats: awsStats
        };
      } catch (error) {
        console.warn('Failed to get AWS Rekognition stats:', error);
      }
    }

    return stats;
  }

  /**
   * Delete all face data for a patient (GDPR compliance)
   */
  async deletePatientData(patientId: PatientId): Promise<boolean> {
    try {
      // Remove from cache
      this.encodingCache.delete(patientId);

      // Remove from AWS if available
      if (this.useAWS && this.awsRekognition) {
        const deleted = await this.awsRekognition.deletePatientFace(patientId);
        if (deleted) {
          console.log(`✅ Patient ${patientId} face data deleted from AWS`);
        }
        return deleted;
      }

      // Remove from mock storage (local storage or database)
      await this.removeFaceEncoding(patientId);
      console.log(`✅ Patient ${patientId} face data deleted from local storage`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to delete patient ${patientId} face data:`, error);
      return false;
    }
  }
}