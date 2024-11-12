import { requestPermissionsAsync, scheduleNotificationAsync, cancelAllScheduledNotificationsAsync } from 'expo-notifications';
import { Platform } from 'react-native';

// Request permissions for notifications
export const requestNotificationPermissions = async () => {
const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') {
        alert('Please enable notifications in your settings.');
    }
};

// Schedule a notification for when an achievement is unlocked
export const sendAchievementNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: Platform.OS === 'android' ? 'default' : undefined,
        },
        trigger: null, // Immediately send the notification
    });
};

// Schedule a daily reminder if the user has not completed their goal
export const scheduleDailyReminder = async (hour: number, minute: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync(); // Clear previous reminders
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Daily Reminder',
            body: 'Don’t forget to complete your daily step goal!',
            sound: Platform.OS === 'android' ? 'default' : undefined,
        },
        trigger: {
            hour,
            minute,
            repeats: true,
        },
    });
};
