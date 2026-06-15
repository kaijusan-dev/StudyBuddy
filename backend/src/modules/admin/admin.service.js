import * as adminRepository from './admin.repository.js'
import * as scheduleService from '#schedule';
import * as authService from '#auth';
import { getPet } from '#pet';

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

async function addEvent(event) {
    try {
        return await scheduleService.createEvent(event);
    }
    catch (err) {
        console.error('Error adding event: ', err.message);
    };
}

async function deleteEvent(id) {
    try {
        return await scheduleService.deleteEvent(id);
    }
    catch (err) {
        console.error('Error deleting event: ', err.message);
    };
}

async function setPetXp(userId, xp) {
    try {
        if (xp < 0) {
            throw new Error("XP cannot be negative");
        }

        return await adminRepository.setPetXp(userId, xp);

    } catch (err) {
        console.error("Error setting pet XP:", err.message);
    }
}

async function setPetLevel(userId, level) {
    try {
        if (level < 1) {
            throw new Error("Level must be >= 1");
        }

        return await adminRepository.setPetLevel(userId, level);

    } catch (err) {
        console.error("Error setting pet level:", err.message);
    }
}

async function createTestUser() {
  try {
    const user = await authService.registerUser({
      username: `test`,
      email: `test@test.com`,
      group_id: 1,
      password: "123456",
    });

    await getPet(user.id);

    console.log("created test user:", user);

  } catch (err) {
    console.error(
      "Failed to create test user:",
      err.message
    );
  }
}

async function createTestUsers(count = 20) {
    const users = [];

    for (let i = 0; i < count; i++) {
        const randomXp =
            Math.floor(Math.random() * 5000);

        const randomLevel =
            Math.floor(randomXp / 1000) + 1;

        const uniqueId =
            `${Date.now()}_${i}`;

        try {
            const user =
                await authService.registerUser({
                    username: `test_user_${uniqueId}`,
                    email: `test${uniqueId}@test.com`,
                    group_id: 1,
                    password: "123456",
                });

            await getPet(user.id);

            await adminRepository.setPetXp(
                user.id,
                randomXp
            );

            users.push(user);

        } catch (err) {

            console.error(
                `Failed creating test user ${i}:`,
                err.message
            );

            continue;
        }
    }

    console.log(
        `Created ${users.length} test users`
    );

    return users;
}

export {
    getUsers,
    toggleRole,
    deleteUser,
    addEvent,
    deleteEvent,
    setPetXp,
    setPetLevel,
    createTestUser,
    createTestUsers
};