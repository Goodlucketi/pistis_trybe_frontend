import emailjs from "@emailjs/browser";

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendFeedback = async ({ fromName, fromEmail, message }) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error("EmailJS environment variables are not configured.");
  }

  const templateParams = {
    from_name: fromName,
    from_email: fromEmail,
    message,
    to_name: "Pistis Trybe Team",
    sent_at: new Date().toLocaleString(),
  };

  const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  return response;
};