import * as adminService from '../services/admin.service.js'

const getUsers = async (req, res) => {
    try {
        const result = await adminService.getUsers();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const toggleRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await adminService.toggleRole(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle user role: ', id });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteUser(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}

const addEvent = async (req, res) => {
    try {
        const result = await adminService.addEvent(req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add event' });
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteEvent(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

export { getUsers, toggleRole, deleteUser, addEvent, deleteEvent };