import { mockGroups } from '../data/mockData';
let groups = [...mockGroups];
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getGroups = async () => {
    await delay(500);
    return [...groups].sort((a, b) => a.name.localeCompare(b.name));
};
export const getGroupById = async (id) => {
    await delay(300);
    return groups.find(g => g.id === id);
};
export const saveGroup = async (groupData) => {
    await delay(400);
    if (groupData.id) {
        // Update
        const existingGroup = groups.find(g => g.id === groupData.id);
        const updatedGroup = {
            ...existingGroup,
            ...groupData,
            capacity: {
                ...existingGroup.capacity,
                current: groupData.members.length,
            }
        };
        groups = groups.map(g => (g.id === groupData.id ? updatedGroup : g));
        return updatedGroup;
    }
    else {
        // Create
        const newGroup = {
            id: `group_${Date.now()}`,
            ...groupData,
            capacity: {
                max: 8, // Default max
                current: groupData.members.length,
            },
            status: 'active',
        };
        groups.unshift(newGroup);
        return newGroup;
    }
};
