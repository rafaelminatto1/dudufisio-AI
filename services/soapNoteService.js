import { db } from './mockDb';
import { eventService } from './eventService';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getNotesByPatientId = async (patientId) => {
    await delay(300);
    return [...db.getSoapNotes()]
        .filter(n => n.patientId === patientId)
        .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
};
export const addNote = async (patientId, noteData) => {
    await delay(400);
    const newNote = {
        id: `note_${Date.now()}`,
        patientId,
        therapist: 'Dr. Roberto', // Assuming logged in user
        ...noteData
    };
    db.saveSoapNote(newNote);
    eventService.emit('notes:changed');
    return newNote;
};
export const getSoapNoteById = async (id) => {
    await delay(300);
    return db.getSoapNotes().find(note => note.id === id);
};
export const saveNote = async (noteData) => {
    await delay(300);
    let noteToSave;
    if (noteData.id) {
        const existingNote = db.getSoapNotes().find(n => n.id === noteData.id);
        noteToSave = { ...existingNote, ...noteData };
    }
    else {
        noteToSave = {
            id: `note_${Date.now()}`,
            therapist: 'Dr. Roberto',
            date: new Date().toLocaleDateString('pt-BR'),
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
            ...noteData,
        };
    }
    db.saveSoapNote(noteToSave);
    eventService.emit('notes:changed');
    return noteToSave;
};
