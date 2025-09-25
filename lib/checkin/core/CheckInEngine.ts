import {
  CheckInData,
  CheckInResult,
  CheckIn,
  PatientId,
  AppointmentId,
  AppointmentValidation,
  PatientMatch,
  PatientSearchCriteria
} from '../../../types/checkin';

import { FaceRecognitionService } from './FaceRecognition';
import { QueueManager, QueuePositionImpl } from './QueueManager';
import { HealthScreening, HealthScreeningResultImpl } from '../validation/HealthScreening';

interface AppointmentService {
  validateAppointment(patientId: PatientId, date: Date): Promise<AppointmentValidation>;
  getAppointment(appointmentId: AppointmentId): Promise<any>;
}

interface PatientService {
  searchPatient(criteria: PatientSearchCriteria): Promise<PatientSearchResult>;
  getPatient(patientId: PatientId): Promise<any>;
}

interface NotificationService {
  notifyStaff(checkIn: CheckIn): Promise<void>;
  notifyPatient(patientId: PatientId, message: string): Promise<void>;
}

interface PrinterService {
  printCheckInReceipt(checkIn: CheckIn): Promise<void>;
}

interface PatientSearchResult {
  matches: PatientMatch[];
  isUnique(): boolean;
  hasMultipleMatches(): boolean;
}

class PatientSearchResultImpl implements PatientSearchResult {
  constructor(public matches: PatientMatch[]) {}

  isUnique(): boolean {
    return this.matches.length === 1;
  }

  hasMultipleMatches(): boolean {
    return this.matches.length > 1;
  }

  get patientId(): PatientId | null {
    return this.isUnique() ? this.matches[0].patientId : null;
  }
}

export class CheckInResultImpl implements CheckInResult {
  constructor(
    public success: boolean,
    public checkIn?: CheckIn,
    public requiresManualSelection?: PatientMatch[],
    public error?: string
  ) {}

  static success(checkIn: CheckIn): CheckInResult {
    return new CheckInResultImpl(true, checkIn);
  }

  static patientNotFound(): CheckInResult {
    return new CheckInResultImpl(false, undefined, undefined, 'Patient not found');
  }

  static noValidAppointment(reason: string): CheckInResult {
    return new CheckInResultImpl(false, undefined, undefined, `No valid appointment: ${reason}`);
  }

  static healthScreeningFailed(issues: string[]): CheckInResult {
    return new CheckInResultImpl(false, undefined, undefined, `Health screening failed: ${issues.join(', ')}`);
  }

  static requiresManualSelection(matches: PatientMatch[]): CheckInResult {
    return new CheckInResultImpl(false, undefined, matches, 'Multiple patients found - manual selection required');
  }
}

// Mock services implementations
class MockAppointmentService implements AppointmentService {
  async validateAppointment(patientId: PatientId, date: Date): Promise<AppointmentValidation> {
    // Mock validation - in production, this would check the actual appointment database
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (!isToday) {
      return { isValid: false, reason: 'No appointment scheduled for today' };
    }

    // Simulate finding appointment
    if (Math.random() > 0.1) { // 90% chance of valid appointment
      return {
        isValid: true,
        appointmentId: `apt-${Date.now()}` as AppointmentId
      };
    }

    return { isValid: false, reason: 'Appointment not found or cancelled' };
  }

  async getAppointment(appointmentId: AppointmentId): Promise<any> {
    return {
      id: appointmentId,
      patientId: 'patient-123',
      scheduledTime: new Date(),
      type: 'therapy_session',
      status: 'scheduled'
    };
  }
}

class MockPatientService implements PatientService {
  async searchPatient(criteria: PatientSearchCriteria): Promise<PatientSearchResult> {
    const matches: PatientMatch[] = [];

    // Mock search results
    if (criteria.name) {
      const confidence = criteria.name.length > 3 ? 0.9 : 0.6;
      matches.push({
        patientId: 'patient-1' as PatientId,
        name: `Patient matching "${criteria.name}"`,
        confidence,
        matchingFields: ['name']
      });

      // Sometimes add multiple matches to test selection flow
      if (Math.random() > 0.7) {
        matches.push({
          patientId: 'patient-2' as PatientId,
          name: `Another patient matching "${criteria.name}"`,
          confidence: confidence - 0.1,
          matchingFields: ['name']
        });
      }
    }

    if (criteria.phoneNumber) {
      matches.push({
        patientId: 'patient-phone' as PatientId,
        name: 'Patient found by phone',
        confidence: 0.95,
        matchingFields: ['phoneNumber']
      });
    }

    return new PatientSearchResultImpl(matches);
  }

  async getPatient(patientId: PatientId): Promise<any> {
    return {
      id: patientId,
      name: 'John Doe',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+5511999999999'
    };
  }
}

class MockNotificationService implements NotificationService {
  async notifyStaff(checkIn: CheckIn): Promise<void> {
    console.log(`Staff notification: Patient ${checkIn.patientId} has checked in for appointment ${checkIn.appointmentId}`);
  }

  async notifyPatient(patientId: PatientId, message: string): Promise<void> {
    console.log(`Patient notification to ${patientId}: ${message}`);
  }
}

class MockPrinterService implements PrinterService {
  async printCheckInReceipt(checkIn: CheckIn): Promise<void> {
    console.log(`Printing check-in receipt for patient ${checkIn.patientId}`);
    console.log(`Queue position: ${checkIn.queuePosition}`);
    console.log(`Estimated wait time: ${checkIn.estimatedWaitTime} minutes`);
  }
}

export class CheckInEngine {
  private sessionCounter = 0;

  constructor(
    private readonly faceRecognition: FaceRecognitionService,
    private readonly appointmentService: AppointmentService = new MockAppointmentService(),
    private readonly patientService: PatientService = new MockPatientService(),
    private readonly queueManager: QueueManager,
    private readonly notificationService: NotificationService = new MockNotificationService(),
    private readonly printerService: PrinterService = new MockPrinterService()
  ) {}

  async processCheckIn(checkInData: CheckInData): Promise<CheckInResult> {
    const sessionId = ++this.sessionCounter;
    console.log(`Starting check-in session ${sessionId} on device ${checkInData.deviceId}`);

    try {
      // 1. Patient identification
      let patientId: PatientId | null = null;

      // Try facial recognition first if photo provided
      if (checkInData.photo) {
        console.log('Attempting facial recognition...');
        const recognition = await this.faceRecognition.recognizePatient(checkInData.photo);

        if (recognition.type === 'success') {
          patientId = recognition.patientId!;
          console.log(`Patient identified via facial recognition: ${patientId} (confidence: ${recognition.confidence})`);
        } else {
          console.log(`Facial recognition failed: ${recognition.type}`);
        }
      }

      // Fallback to manual search if facial recognition failed or no photo
      if (!patientId && checkInData.searchCriteria) {
        console.log('Attempting manual patient search...');
        const searchResult = await this.patientService.searchPatient(checkInData.searchCriteria);

        if (searchResult.isUnique()) {
          patientId = searchResult.matches[0].patientId;
          console.log(`Patient identified via search: ${patientId}`);
        } else if (searchResult.hasMultipleMatches()) {
          console.log('Multiple patients found - manual selection required');
          return CheckInResultImpl.requiresManualSelection(searchResult.matches);
        }
      }

      if (!patientId) {
        console.log('Patient identification failed');
        return CheckInResultImpl.patientNotFound();
      }

      // 2. Validate appointment
      console.log(`Validating appointment for patient ${patientId}...`);
      const appointmentValidation = await this.appointmentService.validateAppointment(patientId, new Date());

      if (!appointmentValidation.isValid) {
        console.log(`Appointment validation failed: ${appointmentValidation.reason}`);
        return CheckInResultImpl.noValidAppointment(appointmentValidation.reason!);
      }

      console.log(`Valid appointment found: ${appointmentValidation.appointmentId}`);

      // 3. Health screening
      console.log('Performing health screening...');
      const healthScreening = new HealthScreening(patientId, checkInData.healthAnswers);
      const screeningResult = await healthScreening.performScreening();

      if (!screeningResult.isApproved) {
        console.log('Health screening failed');
        const issues = screeningResult.issues || ['Health screening requirements not met'];

        // Generate recommendations for patient
        const recommendations = healthScreening.generateRecommendations();
        await this.notificationService.notifyPatient(
          patientId,
          `Check-in denied: ${issues.join(', ')}. Recommendations: ${recommendations.join(', ')}`
        );

        return CheckInResultImpl.healthScreeningFailed(issues);
      }

      console.log('Health screening passed');

      // 4. Create check-in record
      const checkIn: CheckIn = {
        id: `checkin-${sessionId}-${Date.now()}`,
        patientId,
        appointmentId: appointmentValidation.appointmentId!,
        checkInTime: new Date(),
        method: checkInData.photo ? 'facial_recognition' : 'manual_search',
        deviceId: checkInData.deviceId,
        healthScreeningPassed: true,
        status: 'completed',
        additionalData: {
          sessionId,
          screeningResult,
          recognitionConfidence: checkInData.photo ? 0.9 : undefined, // Mock confidence
          ...checkInData.metadata
        }
      };

      // 5. Add to queue
      console.log('Adding patient to queue...');
      const queuePosition = await this.queueManager.addToQueue(checkIn);
      console.log(`Patient added to queue at position ${queuePosition.position} with estimated wait time ${queuePosition.estimatedWaitTime} minutes`);

      // 6. Notify staff
      await this.notificationService.notifyStaff(checkIn);

      // 7. Print receipt if requested
      if (checkInData.printReceipt) {
        console.log('Printing check-in receipt...');
        await this.printerService.printCheckInReceipt(checkIn);
      }

      // 8. Notify patient of successful check-in
      await this.notificationService.notifyPatient(
        patientId,
        `Check-in successful! You are #${checkIn.queuePosition} in queue. Estimated wait time: ${checkIn.estimatedWaitTime} minutes.`
      );

      console.log(`Check-in session ${sessionId} completed successfully`);
      return CheckInResultImpl.success(checkIn);

    } catch (error) {
      console.error(`Check-in session ${sessionId} failed:`, error);
      return new CheckInResultImpl(false, undefined, undefined, `Check-in failed: ${error}`);
    }
  }

  async getQueueStatus() {
    return this.queueManager.getQueueStatus();
  }

  async processNextPatient(): Promise<CheckIn | null> {
    const nextCheckIn = await this.queueManager.processNextPatient();
    if (nextCheckIn) {
      await this.notificationService.notifyPatient(
        nextCheckIn.patientId,
        'Your appointment is ready! Please proceed to the treatment room.'
      );
    }
    return nextCheckIn;
  }

  async cancelCheckIn(patientId: PatientId): Promise<boolean> {
    const removed = await this.queueManager.removeFromQueue(patientId);
    if (removed) {
      await this.notificationService.notifyPatient(
        patientId,
        'Your check-in has been cancelled.'
      );
    }
    return removed;
  }

  async updateEstimatedWaitTime(patientId: PatientId): Promise<number | null> {
    const queueStatus = this.queueManager.getQueueStatus();
    const patientInQueue = queueStatus.queue.find(entry => entry.patientId === patientId);

    if (patientInQueue) {
      await this.notificationService.notifyPatient(
        patientId,
        `Updated wait time: ${patientInQueue.estimatedWaitTime} minutes`
      );
      return patientInQueue.estimatedWaitTime;
    }

    return null;
  }

  getSessionMetrics() {
    return {
      totalSessions: this.sessionCounter,
      queueLength: this.queueManager.getQueueLength(),
      faceRecognitionCacheSize: this.faceRecognition.getCacheSize()
    };
  }
}