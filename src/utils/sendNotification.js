import { fcm } from "./firebase.js";

/**
 * Send a Firebase push notification with optional data payload.
 *
 * @param {string} fcmToken - User's FCM device token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Optional custom data to include with the notification.
 */
export const sendNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]) // 🔁 تحويل كل القيم إلى string
    ),
  };

  try {
    const response = await fcm.send(message);
    console.log("✅ تم إرسال الإشعار بنجاح:", response);
    return response;
  } catch (error) {
    console.error("❌ حدث خطأ أثناء إرسال الإشعار:", error.message);
    throw error;
  }
};
