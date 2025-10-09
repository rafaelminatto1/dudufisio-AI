const LOG_KEY = 'fisioflow_whatsapp_log';
const getLogsFromStorage = () => {
    const data = sessionStorage.getItem(LOG_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((log) => ({ ...log, createdAt: new Date(log.createdAt) }));
    }
    return [];
};
const saveLogsToStorage = (logs) => {
    sessionStorage.setItem(LOG_KEY, JSON.stringify(logs));
};
export const getLogs = async () => {
    await new Promise(res => setTimeout(res, 300)); // Simulate delay
    const logs = getLogsFromStorage();
    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
export const addLog = async (message) => {
    const logs = getLogsFromStorage();
    logs.unshift(message);
    saveLogsToStorage(logs);
};
export const updateLog = async (messageId, updates) => {
    const logs = getLogsFromStorage();
    const index = logs.findIndex(log => log.id === messageId);
    if (index > -1) {
        const updatedMessage = {
            ...logs[index],
            ...updates,
            // Ensure createdAt is always a Date object
            createdAt: updates.createdAt instanceof Date ? updates.createdAt : logs[index].createdAt
        };
        logs[index] = updatedMessage;
        saveLogsToStorage(logs);
    }
};
