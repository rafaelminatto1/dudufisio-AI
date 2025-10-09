import { mockTasks, mockProjects } from '../data/mockData';
let tasks = [...mockTasks];
const projects = [...mockProjects];
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getProjects = async () => {
    await delay(300);
    return [...projects];
};
export const getTasks = async (projectId) => {
    await delay(500);
    if (projectId) {
        return [...tasks].filter(t => t.projectId === projectId);
    }
    return [...tasks];
};
export const saveTask = async (taskData, actorUserId) => {
    await delay(400);
    if (taskData.id) {
        // Update
        const updatedTask = { ...tasks.find(t => t.id === taskData.id), ...taskData, actorUserId };
        tasks = tasks.map(t => (t.id === taskData.id ? updatedTask : t));
        return updatedTask;
    }
    else {
        // Create
        const newTask = {
            id: `task_${Date.now()}`,
            ...taskData,
            actorUserId,
        };
        tasks.unshift(newTask);
        return newTask;
    }
};
