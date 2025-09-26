// services/taskService.ts
import { Task, Project } from '../types';
import { mockTasks } from '../data/mockData';
import projectService from './projectService';

let tasks: Task[] = [...mockTasks];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getProjects = async (): Promise<Project[]> => {
    return await projectService.getProjects();
};

export const getTasks = async (projectId?: string): Promise<Task[]> => {
    await delay(500);
    if (projectId) {
        return [...tasks].filter(t => t.projectId === projectId);
    }
    return [...tasks];
};

export const saveTask = async (taskData: Omit<Task, 'id' | 'actorUserId'> & { id?: string }, actorUserId: string): Promise<Task> => {
    await delay(400);

    if (taskData.id) {
        // Update
        const updatedTask = { ...tasks.find(t => t.id === taskData.id)!, ...taskData, actorUserId };
        tasks = tasks.map(t => (t.id === taskData.id ? updatedTask : t));
        return updatedTask;
    } else {
        // Create
        const newTask: Task = {
            id: `task_${Date.now()}`,
            ...taskData,
            actorUserId,
        };
        tasks.unshift(newTask);
        return newTask;
    }
};