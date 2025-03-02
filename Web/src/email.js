// ใช้ EmailJS ส่งอีเมลแจ้งเตือน
function sendEmailNotification(toEmail, subject, message) {
    emailjs.init("YOUR_EMAILJS_USER_ID"); // ตั้งค่า USER ID

    const templateParams = {
        to_email: toEmail,
        subject: subject,
        message: message
    };

    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
        .then(() => {
            console.log("อีเมลแจ้งเตือนถูกส่งเรียบร้อย");
        })
        .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
        });
}
