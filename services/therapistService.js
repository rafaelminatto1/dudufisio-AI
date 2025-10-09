import { mockTherapists } from '../data/mockData';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getTherapists = async () => {
    await delay(200);
    return [...mockTherapists];
};
