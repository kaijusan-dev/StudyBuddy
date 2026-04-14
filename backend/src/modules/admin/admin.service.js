import * as adminRepository from './admin.repository.js'
import * as scheduleRepository from '#schedule';

async function getUsers() {
    try {
        return await adminRepository.getAllUsers();
    } catch (err) {
        console.error('Error fetching users:', err.message);
        return [];
    }
}

async function toggleRole(id) {
    try {
        return await adminRepository.toggleUserRole(id);
    }
    catch (err) {
        console.error('Error toggling user role: ', err.message);
    };
}

async function deleteUser(id) {
    try {
        return await adminRepository.deleteUser(id);
    }
    catch (err) {
        console.error('Error deleting user: ', err.message);
    };
}

async function addEvent(eventData) {
    try {
        return await scheduleRepository.addEventToSchedule(eventData);
    }
    catch (err) {
        console.error('Error adding event: ', err.message);
    };
}

async function deleteEvent(id) {
    try {
        return await scheduleRepository.deleteEventFromSchedule(id);
    }
    catch (err) {
        console.error('Error deleting event: ', err.message);
    };
}

export { getUsers, toggleRole, deleteUser, addEvent, deleteEvent };