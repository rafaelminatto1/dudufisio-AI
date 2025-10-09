import { mockExerciseGroups, mockProtocols } from '../data/mockExerciseLibrary';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getExerciseLibraryData = async () => {
    await delay(500);
    return {
        protocols: mockProtocols,
        exerciseGroups: mockExerciseGroups,
    };
};
