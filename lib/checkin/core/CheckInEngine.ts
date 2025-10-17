/* eslint-disable no-unused-vars */
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
import { QueueManager } from './QueueManager';
import { HealthScreening } from '../validation/HealthScreening';
import { logger } from '../../logger';

interface AppointmentService {
  validateAppointment(_patientId: PatientId, _date: Date): Promise<AppointmentValidation>;
  getAppointment(_appointmentId: AppointmentId): Promise<unknown>;
}

interface PatientService {
  searchPatient(_criteria: PatientSearchCriteria): Promise<PatientSearchResult>;
  getPatient(_patientId: PatientId): Promise<unknown>;
}

interface NotificationService {
  notifyStaff(_checkIn: CheckIn): Promise<void>;
  notifyPatient(_patientId: PatientId, _message: string): Promise<void>;
}

interface PrinterService {
  printCheckInReceipt(_checkIn: CheckIn): Promise<void>;
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
  // Values are consumed by callers
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

  async getAppointment(appointmentId: AppointmentId): Promise<unknown> {
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

  async getPatient(patientId: PatientId): Promise<unknown> {
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
    logger.info(`Staff notification sent for patient ${checkIn.patientId}.`, {
      context: 'checkin.engine.mockNotification',
      data: {
        patientId: checkIn.patientId,
        appointmentId: checkIn.appointmentId,
      },
    });
  }

  async notifyPatient(patientId: PatientId, message: string): Promise<void> {
    logger.debug('Patient notification sent.', {
      context: 'checkin.engine.mockNotification',
      data: { patientId, message },
    });
  }
}

class MockPrinterService implements PrinterService {
  async printCheckInReceipt(checkIn: CheckIn): Promise<void> {
    logger.debug('Printing check-in receipt for patient.', {
      context: 'checkin.engine.mockPrinter',
      data: {
        patientId: checkIn.patientId,
        queuePosition: checkIn.queuePosition,
        estimatedWaitTime: checkIn.estimatedWaitTime,
      },
    });
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
    logger.info(`Starting check-in session ${sessionId} on device ${checkInData.deviceId}.`, {
      context: 'checkin.engine.session',
      data: { sessionId, deviceId: checkInData.deviceId },
    });

    try {
      // 1. Patient identification
      let patientId: PatientId | null = null;

      // Try facial recognition first if photo provided
      if (checkInData.photo) {
        logger.debug('Attempting facial recognition.', { context: 'checkin.engine.identification' });
        const recognition = await this.faceRecognition.recognizePatient(checkInData.photo);

        if (recognition.type === 'success' && recognition.patientId) {
          patientId = recognition.patientId;
          logger.info('Patient identified via facial recognition.', {
            context: 'checkin.engine.identification',
            data: { patientId, confidence: recognition.confidence },
          });
        } else {
          logger.warn('Facial recognition failed.', {
            context: 'checkin.engine.identification',
            data: { type: recognition.type },
          });
        }
      }

      // Fallback to manual search if facial recognition failed or no photo
      if (!patientId && checkInData.searchCriteria) {
        logger.debug('Attempting manual patient search.', { context: 'checkin.engine.identification' });
        const searchResult = await this.patientService.searchPatient(checkInData.searchCriteria);

        if (searchResult.isUnique()) {
          patientId = searchResult.matches[0].patientId;
          logger.info('Patient identified via manual search.', {
            context: 'checkin.engine.identification',
            data: { patientId },
          });
        } else if (searchResult.hasMultipleMatches()) {
          logger.warn('Multiple patient matches found - manual selection required.', {
            context: 'checkin.engine.identification',
          });
          return CheckInResultImpl.requiresManualSelection(searchResult.matches);
        }
      }

      if (!patientId) {
        logger.error('Patient identification failed.', { context: 'checkin.engine.identification' });
        return CheckInResultImpl.patientNotFound();
      }

      // 2. Validate appointment
      logger.debug('Validating appointment for patient.', {
        context: 'checkin.engine.appointment',
        data: { patientId },
      });
      const appointmentValidation = await this.appointmentService.validateAppointment(patientId, new Date());

      if (!appointmentValidation.isValid) {
        logger.warn('Appointment validation failed.', {
          context: 'checkin.engine.appointment',
          data: { reason: appointmentValidation.reason },
        });
        return CheckInResultImpl.noValidAppointment(appointmentValidation.reason ?? 'Unknown reason');
      }

      logger.info('Valid appointment found.', {
        context: 'checkin.engine.appointment',
        data: { appointmentId: appointmentValidation.appointmentId },
      });

      // 3. Health screening
      logger.debug('Performing health screening.', { context: 'checkin.engine.healthScreening' });
      const healthScreening = new HealthScreening(patientId, checkInData.healthAnswers);
      const screeningResult = await healthScreening.performScreening();

      if (!screeningResult.isApproved) {
        logger.warn('Health screening failed.', { context: 'checkin.engine.healthScreening' });
        const issues = screeningResult.issues || ['Health screening requirements not met'];

        // Generate recommendations for patient
        const recommendations = healthScreening.generateRecommendations();
        await this.notificationService.notifyPatient(
          patientId,
          `Check-in denied: ${issues.join(', ')}. Recommendations: ${recommendations.join(', ')}`
        );

        return CheckInResultImpl.healthScreeningFailed(issues);
      }

      logger.info('Health screening passed.', { context: 'checkin.engine.healthScreening' });

      // 4. Create check-in record
      const checkIn: CheckIn = {
        id: `checkin-${sessionId}-${Date.now()}`,
        patientId,
        appointmentId: (appointmentValidation.appointmentId || 'unknown') as AppointmentId,
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
      logger.debug('Adding patient to queue.', { context: 'checkin.engine.queue' });
      const queuePosition = await this.queueManager.addToQueue(checkIn);
      logger.info('Patient added to queue.', {
        context: 'checkin.engine.queue',
        data: {
          position: queuePosition.position,
          estimatedWaitTime: queuePosition.estimatedWaitTime,
        },
      });

      // 6. Notify staff
      await this.notificationService.notifyStaff(checkIn);

      // 7. Print receipt if requested
      if (checkInData.printReceipt) {
        logger.debug('Printing check-in receipt...', { context: 'checkin.engine.receipt' });
        await this.printerService.printCheckInReceipt(checkIn);
      }

      // 8. Notify patient of successful check-in
      await this.notificationService.notifyPatient(
        patientId,
        `Check-in successful! You are #${checkIn.queuePosition} in queue. Estimated wait time: ${checkIn.estimatedWaitTime} minutes.`
      );

      logger.info(`Check-in session ${sessionId} completed successfully.`, {
        context: 'checkin.engine.session',
        data: { sessionId },
      });
      return CheckInResultImpl.success(checkIn);

    } catch (error) {
      logger.error(`Check-in session ${sessionId} failed.`, {
        context: 'checkin.engine.session',
        data: { sessionId, error },
      });
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
