import nodemailer from "nodemailer"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from "axios";

// Configure the email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


export const emailWithNodeMail = async (name, email, imageUrl, subject, body) => {
    try {
        const imageBytes = await axios
            .get(imageUrl, { responseType: "arraybuffer" })
            .then((res) => res.data);

        const pdfDoc = await PDFDocument.create();

        let image;
        if (imageUrl.endsWith(".png")) {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            image = await pdfDoc.embedJpg(imageBytes);
        }

        const imgWidth = image.width;
        const imgHeight = image.height;

        // 4️⃣ Add page same size as image
        const page = pdfDoc.addPage([imgWidth, imgHeight]);

        // 5️⃣ Draw image as background
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
        });

        // 6️⃣ Embed font
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const fontSize = 60;

        // 7️⃣ Center the name perfectly
        const textWidth = font.widthOfTextAtSize(name.toUpperCase(), fontSize);

        page.drawText(name.toUpperCase(), {
            x: (imgWidth - textWidth) / 2,
            y: imgHeight / 2 + 90, // adjust vertically
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });

        // 8️⃣ Save PDF
        const pdfBytes = await pdfDoc.save();

        // 9️⃣ Send Email with PDF attachment
        const mailOptions = {
            from: `"India Market Entry" <contact@indiamarketentry.com>`,
            to: email,
            subject: `${subject}`,
            html: `
        <p>Hi ${name},</p>
        ${body}
      `,
            attachments: [
                {
                    filename: `Certificate_${name}.pdf`,
                    content: Buffer.from(pdfBytes),
                    contentType: "application/pdf",
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent:", email);

        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Error sending certificate:", error);
        return { success: false };
    }
};


export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"India Market Entry" <contact@indiamarketentry.com>`,
      to: email,
      subject: "Verify Your Email - OTP Inside",
      html: `
        <div style="max-width: 500px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          
          <div style="background: #4f5d8c; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Knotral Tranings</h2>
          </div>

          <div style="padding: 30px; text-align: center;">
            <p style="font-size: 16px; color: #555;">Use the OTP below to verify your email</p>

            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #000;">
              ${otp}
            </div>

            <p style="color: #888;">Valid for 5 minutes</p>

            <hr style="margin: 30px 0;" />

            <p style="font-size: 12px; color: #aaa;">
              If you didn’t request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP Email sent:", email);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return { success: false };
  }
};