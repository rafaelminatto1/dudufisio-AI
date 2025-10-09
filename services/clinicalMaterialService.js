// services/clinicalMaterialService.ts
import { mockMaterialCategories } from '../data/mockClinicalMaterials';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getMaterialCategories = async () => {
    await delay(100);
    return [...mockMaterialCategories];
};
export const getMaterialById = async (id) => {
    await delay(100);
    for (const category of mockMaterialCategories) {
        const material = category.materials.find(m => m.id === id);
        if (material) {
            return { ...material, category };
        }
    }
    return undefined;
};
