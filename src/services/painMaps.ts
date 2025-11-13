import { BODY_REGIONS_BACK, BODY_REGIONS_FRONT, type BodyRegion } from '@/components/body-map-pro/body-regions-data';
import * as legacyBodyMapService from '@/services/bodyMapService';
import type { BodyMapPainRegion, BodyMapSession } from '@/types';
import type { PainTypeValue } from '@/src/components/BodyMap/constants';

const REGION_LOOKUP = new Map<
  string,
  { region: BodyRegion; view: 'front' | 'back' }
>([
  ...BODY_REGIONS_FRONT.map((region) => [region.id, { region, view: 'front' }] as const),
  ...BODY_REGIONS_BACK.map((region) => [region.id, { region, view: 'back' }] as const),
]);

const DEFAULT_MAIN_COMPLAINT = 'sem_queixa_principal';

export interface PainRegionEntry {
  regionId: string;
  intensity: number;
  type: PainTypeValue;
  notes?: string;
}

export interface PainMapSnapshot {
  session: BodyMapSession;
  regions: PainRegionEntry[];
}

export interface SavePainMapInput {
  patientId: string;
  professionalId: string;
  regions: PainRegionEntry[];
  sessionId?: string;
  sessionDate?: Date;
  notes?: string;
}

function toPercentCoordinates(region: BodyRegion) {
  const xPercent = Number(((region.x / 300) * 100).toFixed(2));
  const yPercent = Number(((region.y / 600) * 100).toFixed(2));
  return { x: xPercent, y: yPercent };
}

function mapPainRegionModel(model: BodyMapPainRegion): PainRegionEntry {
  return {
    regionId: model.bodyRegion,
    intensity: model.painLevel,
    type: (model.painTypes && model.painTypes[0] ? model.painTypes[0] : 'aguda') as PainTypeValue,
    notes: model.description ?? undefined,
  };
}

function mapSnapshot(session: BodyMapSession): PainMapSnapshot {
  return {
    session,
    regions: (session.painRegions ?? []).map(mapPainRegionModel),
  };
}

export async function fetchLatestPainMap(patientId: string): Promise<PainMapSnapshot | null> {
  const history = await legacyBodyMapService.getPatientBodyMapHistory(patientId);
  if (!history || history.length === 0) {
    return null;
  }

  const latestSession = history[0];
  return mapSnapshot(latestSession);
}

export async function fetchPainMapSession(sessionId: string): Promise<PainMapSnapshot | null> {
  const session = await legacyBodyMapService.getBodyMapSession(sessionId);
  if (!session) {
    return null;
  }

  return mapSnapshot(session);
}

export async function savePainMapSnapshot(input: SavePainMapInput): Promise<PainMapSnapshot> {
  const {
    patientId,
    professionalId,
    regions,
    sessionId,
    sessionDate = new Date(),
    notes,
  } = input;

  const overallPainLevel =
    regions.length > 0
      ? regions.reduce((sum, region) => sum + region.intensity, 0) / regions.length
      : 0;
  const painFree = regions.every((region) => region.intensity === 0);

  let session: BodyMapSession | null = null;

  if (sessionId) {
    session = await legacyBodyMapService.getBodyMapSession(sessionId);
  }

  if (!session) {
    session = await legacyBodyMapService.createBodyMapSession({
      patientId,
      sessionId: sessionId ?? undefined,
      appointmentId: undefined,
      mainComplaintRegion: DEFAULT_MAIN_COMPLAINT,
      mainComplaintDescription: undefined,
      sessionDate,
      overallPainLevel,
      painFree,
      notes,
      createdBy: professionalId,
    });
  } else {
    await legacyBodyMapService.updateBodyMapSession(session.id, {
      sessionDate,
      overallPainLevel,
      painFree,
      notes,
    });
  }

  const freshSession =
    (await legacyBodyMapService.getBodyMapSession(session.id)) ?? session;
  const existingRegions = new Map(
    (freshSession.painRegions ?? []).map((region) => [region.bodyRegion, region]),
  );

  const incomingIds = new Set(regions.map((region) => region.regionId));

  // Remove regiões que não estão mais presentes
  for (const region of freshSession.painRegions ?? []) {
    if (!incomingIds.has(region.bodyRegion)) {
      await legacyBodyMapService.removePainRegion(region.id);
    }
  }

  // Upsert regiões atuais
  for (const entry of regions) {
    const metadata = REGION_LOOKUP.get(entry.regionId);
    if (!metadata) {
      console.warn('[painMaps] Região desconhecida:', entry.regionId);
      continue;
    }

    const coordinates = toPercentCoordinates(metadata.region);
    const existing = existingRegions.get(entry.regionId);

    if (existing) {
      await legacyBodyMapService.updatePainRegion(existing.id, {
        painLevel: entry.intensity,
        painTypes: [entry.type],
        description: entry.notes,
        isActive: entry.intensity > 0,
      });
    } else {
      await legacyBodyMapService.addPainRegion({
        bodyMapSessionId: freshSession.id,
        patientId,
        bodyRegion: entry.regionId,
        bodySide: metadata.view,
        coordinatesX: coordinates.x,
        coordinatesY: coordinates.y,
        painLevel: entry.intensity,
        painTypes: [entry.type],
        symptoms: [],
        description: entry.notes,
        isMainComplaint: false,
        isActive: entry.intensity > 0,
      });
    }
  }

  const updatedSession =
    (await legacyBodyMapService.getBodyMapSession(freshSession.id)) ?? freshSession;
  return mapSnapshot(updatedSession);
}

export async function fetchPainMapHistory(patientId: string): Promise<PainMapSnapshot[]> {
  const history = await legacyBodyMapService.getPatientBodyMapHistory(patientId);
  return history.map(mapSnapshot);
}

export interface PainEvolutionPoint {
  sessionId: string;
  sessionDate: Date;
  averageIntensity: number;
  maxIntensity: number;
  activeRegions: number;
}

export function buildPainEvolutionSeries(history: PainMapSnapshot[]): PainEvolutionPoint[] {
  return history.map((snapshot) => {
    const intensities = snapshot.regions.map((region) => region.intensity);
    const averageIntensity =
      intensities.length > 0
        ? intensities.reduce((sum, value) => sum + value, 0) / intensities.length
        : 0;
    const maxIntensity = intensities.length > 0 ? Math.max(...intensities) : 0;
    const activeRegions = snapshot.regions.filter((region) => region.intensity > 0).length;

    return {
      sessionId: snapshot.session.id,
      sessionDate: snapshot.session.sessionDate,
      averageIntensity,
      maxIntensity,
      activeRegions,
    };
  });
}

