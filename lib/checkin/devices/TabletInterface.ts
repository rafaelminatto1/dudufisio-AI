import { CheckInEngine } from '../core/CheckInEngine';
import {
  TabletConfig,
  CheckInData,
  CheckInResult,
  DeviceId,
  HealthScreeningAnswers,
  PatientSearchCriteria
} from '../../../types/checkin';

interface CameraService {
  initialize(): Promise<void>;
  capturePhoto(): Promise<ImageData | null>;
  isAvailable(): boolean;
  getStream(): Promise<MediaStream>;
}

interface PrinterService {
  testConnection(): Promise<boolean>;
  print(content: string): Promise<void>;
  isReady(): boolean;
}

interface CheckInFlow {
  start(): Promise<void>;
  getCurrentStep(): CheckInStep;
  nextStep(): Promise<void>;
  previousStep(): Promise<void>;
  complete(): Promise<CheckInResult>;
  cancel(): Promise<void>;
}

abstract class CheckInStep {
  abstract name: string;
  abstract title: string;
  abstract description: string;

  abstract render(): Promise<HTMLElement>;
  abstract validate(): Promise<boolean>;
  abstract getData(): any;
  abstract onEnter(): Promise<void>;
  abstract onExit(): Promise<void>;
}

class WelcomeStep extends CheckInStep {
  name = 'welcome';
  title = 'Welcome to FisioFlow';
  description = 'Touch the screen to begin your check-in process';

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 text-center';

    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-blue-600 mb-4">Welcome!</h1>
        <p class="text-2xl text-gray-600 mb-8">Ready for your appointment?</p>
        <div class="animate-pulse">
          <p class="text-xl text-blue-500">Touch anywhere to start</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-4xl mb-4">📷</div>
          <h3 class="text-xl font-semibold mb-2">Face Recognition</h3>
          <p class="text-gray-600">Quick check-in with facial recognition</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">Manual Search</h3>
          <p class="text-gray-600">Find your appointment by name or phone</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-4xl mb-4">📱</div>
          <h3 class="text-xl font-semibold mb-2">QR Code</h3>
          <p class="text-gray-600">Scan your appointment QR code</p>
        </div>
      </div>
    `;

    return container;
  }

  async validate(): Promise<boolean> {
    return true; // Welcome step is always valid
  }

  getData(): any {
    return {};
  }

  async onEnter(): Promise<void> {
    console.log('Welcome step entered');
  }

  async onExit(): Promise<void> {
    console.log('Welcome step exited');
  }
}

class PhotoCaptureStep extends CheckInStep {
  name = 'photo_capture';
  title = 'Facial Recognition';
  description = 'Please look at the camera for automatic identification';

  private capturedPhoto: ImageData | null = null;

  constructor(private camera: CameraService) {
    super();
  }

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8';

    const cameraAvailable = this.camera.isAvailable();

    if (!cameraAvailable) {
      container.innerHTML = `
        <div class="text-center">
          <div class="text-6xl mb-4">📷</div>
          <h2 class="text-3xl font-bold mb-4">Camera Not Available</h2>
          <p class="text-xl text-gray-600 mb-8">We'll help you check in manually</p>
          <button id="skip-camera" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
            Continue Without Camera
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold mb-4">Facial Recognition Check-in</h2>
          <p class="text-xl text-gray-600 mb-4">Please position your face in the frame</p>
        </div>

        <div class="relative">
          <video id="camera-video" class="rounded-lg shadow-lg" width="640" height="480" autoplay></video>
          <div class="absolute inset-0 border-4 border-dashed border-blue-500 rounded-lg pointer-events-none">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        w-64 h-80 border-2 border-blue-600 rounded-lg">
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded text-sm font-medium">
                Position your face here
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <button id="capture-photo" class="bg-green-600 text-white px-8 py-4 rounded-lg text-xl">
            Take Photo
          </button>
          <button id="retry-photo" class="bg-gray-600 text-white px-8 py-4 rounded-lg text-xl hidden">
            Try Again
          </button>
          <button id="skip-photo" class="bg-gray-400 text-white px-6 py-4 rounded-lg text-lg">
            Skip Camera
          </button>
        </div>

        <div id="photo-preview" class="mt-4 hidden">
          <canvas id="captured-canvas" class="rounded-lg shadow-lg"></canvas>
        </div>
      `;

      this.setupCameraHandlers(container);
    }

    return container;
  }

  private async setupCameraHandlers(container: HTMLElement): Promise<void> {
    const video = container.querySelector('#camera-video') as HTMLVideoElement;
    const captureBtn = container.querySelector('#capture-photo') as HTMLButtonElement;
    const retryBtn = container.querySelector('#retry-photo') as HTMLButtonElement;
    const skipBtn = container.querySelector('#skip-photo') as HTMLButtonElement;
    const preview = container.querySelector('#photo-preview') as HTMLElement;
    const canvas = container.querySelector('#captured-canvas') as HTMLCanvasElement;

    try {
      const stream = await this.camera.getStream();
      video.srcObject = stream;

      captureBtn.addEventListener('click', async () => {
        const photo = await this.captureFromVideo(video, canvas);
        if (photo) {
          this.capturedPhoto = photo;
          video.style.display = 'none';
          preview.classList.remove('hidden');
          captureBtn.classList.add('hidden');
          retryBtn.classList.remove('hidden');
        }
      });

      retryBtn.addEventListener('click', () => {
        this.capturedPhoto = null;
        video.style.display = 'block';
        preview.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        retryBtn.classList.add('hidden');
      });

      skipBtn.addEventListener('click', () => {
        this.capturedPhoto = null;
        // Trigger step navigation
      });

    } catch (error) {
      console.error('Camera setup failed:', error);
      container.innerHTML = `
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-3xl font-bold mb-4">Camera Error</h2>
          <p class="text-xl text-gray-600 mb-8">Unable to access camera</p>
          <button id="continue-manual" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
            Continue Manually
          </button>
        </div>
      `;
    }
  }

  private async captureFromVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<ImageData | null> {
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Photo capture failed:', error);
      return null;
    }
  }

  async validate(): Promise<boolean> {
    return true; // Photo capture is optional
  }

  getData(): any {
    return { photo: this.capturedPhoto };
  }

  async onEnter(): Promise<void> {
    console.log('Photo capture step entered');
  }

  async onExit(): Promise<void> {
    console.log('Photo capture step exited');
    // Clean up camera resources
  }
}

class PatientSearchStep extends CheckInStep {
  name = 'patient_search';
  title = 'Find Your Appointment';
  description = 'Please enter your information to locate your appointment';

  private searchCriteria: PatientSearchCriteria = {};

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto';

    container.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Find Your Appointment</h2>
        <p class="text-xl text-gray-600">Please provide your information</p>
      </div>

      <div class="w-full space-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div class="space-y-2">
          <label for="patient-name" class="block text-lg font-medium">Full Name</label>
          <input
            type="text"
            id="patient-name"
            class="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div class="space-y-2">
          <label for="patient-phone" class="block text-lg font-medium">Phone Number</label>
          <input
            type="tel"
            id="patient-phone"
            class="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div class="space-y-2">
          <label for="patient-birth" class="block text-lg font-medium">Date of Birth (Optional)</label>
          <input
            type="date"
            id="patient-birth"
            class="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="flex gap-4 pt-4">
          <button id="search-patient" class="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg text-xl font-medium">
            Find Appointment
          </button>
          <button id="clear-search" class="bg-gray-400 text-white px-6 py-4 rounded-lg text-xl">
            Clear
          </button>
        </div>
      </div>

      <div id="search-results" class="w-full mt-6 hidden">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h3 class="text-xl font-bold mb-4">Found Appointments</h3>
          <div id="results-list" class="space-y-2"></div>
        </div>
      </div>
    `;

    this.setupSearchHandlers(container);
    return container;
  }

  private setupSearchHandlers(container: HTMLElement): void {
    const nameInput = container.querySelector('#patient-name') as HTMLInputElement;
    const phoneInput = container.querySelector('#patient-phone') as HTMLInputElement;
    const birthInput = container.querySelector('#patient-birth') as HTMLInputElement;
    const searchBtn = container.querySelector('#search-patient') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-search') as HTMLButtonElement;
    const resultsDiv = container.querySelector('#search-results') as HTMLElement;
    const resultsList = container.querySelector('#results-list') as HTMLElement;

    searchBtn.addEventListener('click', () => {
      this.searchCriteria = {
        name: nameInput.value.trim() || undefined,
        phoneNumber: phoneInput.value.trim() || undefined,
        dateOfBirth: birthInput.value ? new Date(birthInput.value) : undefined
      };

      // Mock search results
      this.showSearchResults(resultsList, resultsDiv);
    });

    clearBtn.addEventListener('click', () => {
      nameInput.value = '';
      phoneInput.value = '';
      birthInput.value = '';
      resultsDiv.classList.add('hidden');
      this.searchCriteria = {};
    });

    // Format phone number as user types
    phoneInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
      }
      target.value = value;
    });
  }

  private showSearchResults(resultsList: HTMLElement, resultsDiv: HTMLElement): void {
    // Mock search results
    const mockResults = [
      { id: '1', name: 'João Silva', time: '14:00', type: 'Fisioterapia' },
      { id: '2', name: 'João Santos', time: '15:30', type: 'Avaliação' }
    ];

    resultsList.innerHTML = '';

    mockResults.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.className = 'flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-blue-50';
      resultItem.innerHTML = `
        <div>
          <p class="font-medium text-lg">${result.name}</p>
          <p class="text-gray-600">${result.time} - ${result.type}</p>
        </div>
        <button class="bg-green-600 text-white px-4 py-2 rounded-lg">Select</button>
      `;

      resultItem.addEventListener('click', () => {
        this.selectPatient(result);
      });

      resultsList.appendChild(resultItem);
    });

    resultsDiv.classList.remove('hidden');
  }

  private selectPatient(patient: any): void {
    console.log('Selected patient:', patient);
    // Store selection and proceed to next step
  }

  async validate(): Promise<boolean> {
    return Object.keys(this.searchCriteria).length > 0;
  }

  getData(): any {
    return { searchCriteria: this.searchCriteria };
  }

  async onEnter(): Promise<void> {
    console.log('Patient search step entered');
  }

  async onExit(): Promise<void> {
    console.log('Patient search step exited');
  }
}

class HealthScreeningStep extends CheckInStep {
  name = 'health_screening';
  title = 'Health Screening';
  description = 'Please answer a few health questions';

  private answers: HealthScreeningAnswers = {
    hasSymptoms: false,
    symptoms: [],
    hasBeenExposed: false,
    isVaccinated: true
  };

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 max-w-3xl mx-auto';

    container.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Health Screening</h2>
        <p class="text-xl text-gray-600">Please answer these questions honestly</p>
      </div>

      <div class="w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <!-- Temperature Check -->
        <div class="space-y-4">
          <label class="block text-lg font-medium">Temperature (Optional)</label>
          <div class="flex items-center gap-4">
            <input
              type="number"
              id="temperature"
              step="0.1"
              min="35"
              max="42"
              class="w-32 p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
              placeholder="36.5"
            />
            <span class="text-lg text-gray-600">°C</span>
          </div>
        </div>

        <!-- Symptoms Check -->
        <div class="space-y-4">
          <label class="block text-lg font-medium">Are you experiencing any symptoms today?</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="symptoms" value="no" checked class="w-5 h-5" />
              <span class="text-lg">No symptoms</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="symptoms" value="yes" class="w-5 h-5" />
              <span class="text-lg">I have symptoms</span>
            </label>
          </div>

          <div id="symptoms-list" class="hidden grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="fever" class="w-4 h-4" />
              <span>Fever</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="cough" class="w-4 h-4" />
              <span>Cough</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="shortness_of_breath" class="w-4 h-4" />
              <span>Shortness of breath</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="body_aches" class="w-4 h-4" />
              <span>Body aches</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="headache" class="w-4 h-4" />
              <span>Headache</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="symptom" value="sore_throat" class="w-4 h-4" />
              <span>Sore throat</span>
            </label>
          </div>
        </div>

        <!-- COVID Exposure -->
        <div class="space-y-4">
          <label class="block text-lg font-medium">Have you been exposed to COVID-19 recently?</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="exposure" value="no" checked class="w-5 h-5" />
              <span class="text-lg">No</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="exposure" value="yes" class="w-5 h-5" />
              <span class="text-lg">Yes</span>
            </label>
          </div>
        </div>

        <!-- Vaccination Status -->
        <div class="space-y-4">
          <label class="block text-lg font-medium">COVID-19 Vaccination Status</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="vaccination" value="yes" checked class="w-5 h-5" />
              <span class="text-lg">Vaccinated</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg">
              <input type="radio" name="vaccination" value="no" class="w-5 h-5" />
              <span class="text-lg">Not vaccinated</span>
            </label>
          </div>
        </div>

        <div class="flex gap-4 pt-6">
          <button id="complete-screening" class="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg text-xl font-medium">
            Complete Screening
          </button>
        </div>
      </div>
    `;

    this.setupScreeningHandlers(container);
    return container;
  }

  private setupScreeningHandlers(container: HTMLElement): void {
    const symptomsRadios = container.querySelectorAll('input[name="symptoms"]');
    const symptomsList = container.querySelector('#symptoms-list') as HTMLElement;
    const completeBtn = container.querySelector('#complete-screening') as HTMLButtonElement;

    symptomsRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value === 'yes') {
          symptomsList.classList.remove('hidden');
        } else {
          symptomsList.classList.add('hidden');
        }
      });
    });

    completeBtn.addEventListener('click', () => {
      this.collectAnswers(container);
    });
  }

  private collectAnswers(container: HTMLElement): void {
    const temperature = (container.querySelector('#temperature') as HTMLInputElement).value;
    const hasSymptoms = (container.querySelector('input[name="symptoms"]:checked') as HTMLInputElement).value === 'yes';
    const hasBeenExposed = (container.querySelector('input[name="exposure"]:checked') as HTMLInputElement).value === 'yes';
    const isVaccinated = (container.querySelector('input[name="vaccination"]:checked') as HTMLInputElement).value === 'yes';

    const symptoms: string[] = [];
    if (hasSymptoms) {
      const symptomCheckboxes = container.querySelectorAll('input[name="symptom"]:checked');
      symptomCheckboxes.forEach(cb => {
        symptoms.push((cb as HTMLInputElement).value);
      });
    }

    this.answers = {
      hasSymptoms,
      symptoms,
      temperature: temperature ? parseFloat(temperature) : undefined,
      hasBeenExposed,
      isVaccinated
    };

    console.log('Health screening completed:', this.answers);
  }

  async validate(): Promise<boolean> {
    return true; // Health screening can be completed
  }

  getData(): any {
    return { healthAnswers: this.answers };
  }

  async onEnter(): Promise<void> {
    console.log('Health screening step entered');
  }

  async onExit(): Promise<void> {
    console.log('Health screening step exited');
  }
}

class ConfirmationStep extends CheckInStep {
  name = 'confirmation';
  title = 'Confirm Check-in';
  description = 'Please review and confirm your information';

  private confirmed = false;

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto';

    container.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Confirm Your Check-in</h2>
        <p class="text-xl text-gray-600">Please review your information</p>
      </div>

      <div class="w-full bg-white p-8 rounded-lg shadow-lg">
        <div class="space-y-6">
          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span class="font-medium">Patient:</span>
            <span>João Silva</span>
          </div>

          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span class="font-medium">Appointment:</span>
            <span>Today, 2:00 PM</span>
          </div>

          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span class="font-medium">Type:</span>
            <span>Physiotherapy Session</span>
          </div>

          <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span class="font-medium">Health Screening:</span>
            <span class="text-green-600 font-medium">✓ Passed</span>
          </div>
        </div>

        <div class="mt-8 space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" id="print-receipt" class="w-5 h-5" />
            <span class="text-lg">Print check-in receipt</span>
          </label>
        </div>

        <div class="flex gap-4 mt-8">
          <button id="confirm-checkin" class="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg text-xl font-medium">
            Confirm Check-in
          </button>
          <button id="go-back" class="bg-gray-400 text-white px-6 py-4 rounded-lg text-xl">
            Go Back
          </button>
        </div>
      </div>
    `;

    this.setupConfirmationHandlers(container);
    return container;
  }

  private setupConfirmationHandlers(container: HTMLElement): void {
    const confirmBtn = container.querySelector('#confirm-checkin') as HTMLButtonElement;
    const backBtn = container.querySelector('#go-back') as HTMLButtonElement;

    confirmBtn.addEventListener('click', () => {
      this.confirmed = true;
      console.log('Check-in confirmed');
    });

    backBtn.addEventListener('click', () => {
      console.log('Going back to previous step');
    });
  }

  async validate(): Promise<boolean> {
    return this.confirmed;
  }

  getData(): any {
    const printReceipt = (document.querySelector('#print-receipt') as HTMLInputElement)?.checked || false;
    return { confirmed: this.confirmed, printReceipt };
  }

  async onEnter(): Promise<void> {
    console.log('Confirmation step entered');
  }

  async onExit(): Promise<void> {
    console.log('Confirmation step exited');
  }
}

class CompletionStep extends CheckInStep {
  name = 'completion';
  title = 'Check-in Complete';
  description = 'Your check-in has been completed successfully';

  constructor(private printer: PrinterService) {
    super();
  }

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 text-center';

    container.innerHTML = `
      <div class="mb-8">
        <div class="text-8xl mb-6">✅</div>
        <h1 class="text-4xl font-bold text-green-600 mb-4">Check-in Complete!</h1>
        <p class="text-2xl text-gray-600 mb-8">You have successfully checked in</p>
      </div>

      <div class="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 border-b">
            <span class="font-medium">Queue Position:</span>
            <span class="text-2xl font-bold text-blue-600">#3</span>
          </div>

          <div class="flex justify-between items-center p-3 border-b">
            <span class="font-medium">Estimated Wait:</span>
            <span class="text-2xl font-bold text-orange-600">15 minutes</span>
          </div>

          <div class="flex justify-between items-center p-3">
            <span class="font-medium">Check-in Time:</span>
            <span class="font-medium">${new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            Please have a seat in the waiting area. We'll call you when it's your turn.
          </p>
        </div>
      </div>

      <button id="new-checkin" class="mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
        New Check-in
      </button>
    `;

    this.setupCompletionHandlers(container);
    return container;
  }

  private setupCompletionHandlers(container: HTMLElement): void {
    const newCheckinBtn = container.querySelector('#new-checkin') as HTMLButtonElement;

    newCheckinBtn.addEventListener('click', () => {
      // Reset to welcome screen after 30 seconds or manual click
      console.log('Starting new check-in process');
      window.location.reload();
    });

    // Auto-reset after 30 seconds
    setTimeout(() => {
      window.location.reload();
    }, 30000);
  }

  async validate(): Promise<boolean> {
    return true;
  }

  getData(): any {
    return { completed: true };
  }

  async onEnter(): Promise<void> {
    console.log('Completion step entered');

    // Print receipt if requested
    if (this.printer.isReady()) {
      await this.printer.print(this.generateReceiptText());
    }
  }

  async onExit(): Promise<void> {
    console.log('Completion step exited');
  }

  private generateReceiptText(): string {
    return `
FISIOFLOW CHECK-IN RECEIPT
==========================
Patient: João Silva
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Queue Position: #3
Estimated Wait: 15 minutes

Thank you for choosing FisioFlow!
Please keep this receipt.
==========================
    `.trim();
  }
}

export class CheckInFlowImpl implements CheckInFlow {
  private steps: CheckInStep[];
  private currentStepIndex = 0;
  private flowData: any = {};

  constructor(
    steps: CheckInStep[],
    private onComplete: (data: CheckInData) => Promise<CheckInResult>,
    private onError: (error: Error) => void
  ) {
    this.steps = steps;
  }

  async start(): Promise<void> {
    this.currentStepIndex = 0;
    await this.renderCurrentStep();
  }

  getCurrentStep(): CheckInStep {
    return this.steps[this.currentStepIndex];
  }

  async nextStep(): Promise<void> {
    const currentStep = this.getCurrentStep();

    if (await currentStep.validate()) {
      this.flowData = { ...this.flowData, ...currentStep.getData() };
      await currentStep.onExit();

      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        await this.renderCurrentStep();
      } else {
        await this.complete();
      }
    }
  }

  async previousStep(): Promise<void> {
    if (this.currentStepIndex > 0) {
      await this.getCurrentStep().onExit();
      this.currentStepIndex--;
      await this.renderCurrentStep();
    }
  }

  private async renderCurrentStep(): Promise<void> {
    const step = this.getCurrentStep();
    await step.onEnter();

    const stepElement = await step.render();
    const container = document.getElementById('checkin-container');

    if (container) {
      container.innerHTML = '';
      container.appendChild(stepElement);
    }
  }

  async complete(): Promise<CheckInResult> {
    try {
      const checkInData: CheckInData = {
        deviceId: 'tablet-1' as DeviceId,
        photo: this.flowData.photo,
        searchCriteria: this.flowData.searchCriteria,
        healthAnswers: this.flowData.healthAnswers,
        printReceipt: this.flowData.printReceipt || false,
        metadata: this.flowData
      };

      const result = await this.onComplete(checkInData);

      if (result.success && result.checkIn) {
        // Show completion step
        await this.renderCurrentStep();
      }

      return result;
    } catch (error) {
      this.onError(error as Error);
      throw error;
    }
  }

  async cancel(): Promise<void> {
    console.log('Check-in flow cancelled');
    window.location.reload();
  }
}

// Mock service implementations
class MockCameraService implements CameraService {
  private stream: MediaStream | null = null;

  async initialize(): Promise<void> {
    console.log('Camera service initialized');
  }

  async capturePhoto(): Promise<ImageData | null> {
    // Mock photo capture
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Mock Photo', 270, 240);

      return ctx.getImageData(0, 0, 640, 480);
    }

    return null;
  }

  isAvailable(): boolean {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia !== undefined;
  }

  async getStream(): Promise<MediaStream> {
    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
    }
    return this.stream;
  }
}

class MockPrinterService implements PrinterService {
  async testConnection(): Promise<boolean> {
    console.log('Printer connection tested');
    return true;
  }

  async print(content: string): Promise<void> {
    console.log('Printing:', content);
  }

  isReady(): boolean {
    return true;
  }
}

export class TabletInterface {
  private camera: CameraService;
  private printer: PrinterService;
  private checkInEngine: CheckInEngine;

  constructor(
    config: TabletConfig,
    checkInEngine: CheckInEngine
  ) {
    this.camera = new MockCameraService();
    this.printer = new MockPrinterService();
    this.checkInEngine = checkInEngine;
  }

  async initializeKiosk(): Promise<void> {
    console.log('Initializing tablet kiosk mode...');

    // Set up full screen mode
    await this.setKioskMode();

    // Initialize hardware
    await this.camera.initialize();
    await this.printer.testConnection();

    // Load configuration
    await this.loadLocalConfig();

    // Start the interface
    await this.setupInterface();

    console.log('Tablet kiosk initialized successfully');
  }

  async startCheckInFlow(): Promise<CheckInFlow> {
    const steps = [
      new WelcomeStep(),
      new PhotoCaptureStep(this.camera),
      new PatientSearchStep(),
      new HealthScreeningStep(),
      new ConfirmationStep(),
      new CompletionStep(this.printer)
    ];

    return new CheckInFlowImpl(
      steps,
      this.handleCheckInComplete.bind(this),
      this.handleCheckInError.bind(this)
    );
  }

  private async setKioskMode(): Promise<void> {
    // Set up full screen and kiosk-like behavior
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.warn('Could not enter fullscreen mode:', error);
      }
    }

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent certain keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    });
  }

  private async loadLocalConfig(): Promise<void> {
    // Load any local configuration settings
    console.log('Loading local configuration...');
  }

  private async setupInterface(): Promise<void> {
    // Set up the main interface container
    document.body.innerHTML = `
      <div id="checkin-container" class="min-h-screen bg-gray-100">
        <!-- Check-in flow will be rendered here -->
      </div>
    `;

    // Apply kiosk styling
    document.body.className = 'overflow-hidden select-none';
    document.documentElement.style.fontSize = '18px'; // Larger base font for tablet
  }

  private async handleCheckInComplete(checkInData: CheckInData): Promise<CheckInResult> {
    console.log('Processing check-in:', checkInData);
    return await this.checkInEngine.processCheckIn(checkInData);
  }

  private handleCheckInError(error: Error): void {
    console.error('Check-in flow error:', error);

    // Show error screen
    const container = document.getElementById('checkin-container');
    if (container) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-8 text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h1 class="text-3xl font-bold text-red-600 mb-4">Check-in Error</h1>
          <p class="text-xl text-gray-600 mb-8">Something went wrong. Please try again or ask for assistance.</p>
          <button onclick="location.reload()" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
            Try Again
          </button>
        </div>
      `;
    }
  }
}