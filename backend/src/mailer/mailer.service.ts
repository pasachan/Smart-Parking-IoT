import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  async sendBookingConfirmationMail(to: string, booking: any) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Smart Parking Reservation Confirmed',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parking Reservation Confirmation</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      padding: 24px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    }
    .header {
      background: linear-gradient(90deg, #1a73e8 0%, #4285f4 100%);
      color: #fff;
      padding: 28px 0 18px 0;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      letter-spacing: 1px;
    }
    .content {
      padding: 20px 0 0 0;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .booking-details {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 18px;
      margin: 24px 0 20px 0;
      border: 1px solid #e3e3e3;
    }
    .booking-details h2 {
      margin-top: 0;
      font-size: 20px;
      color: #1a73e8;
    }
    .detail-row {
      display: flex;
      margin-bottom: 10px;
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 10px;
    }
    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      width: 40%;
      color: #555;
    }
    .detail-value {
      width: 60%;
      color: #222;
    }
    .qr-section {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .qr-code {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      background-color: #fff;
      display: inline-block;
    }
    .qr-code img {
      max-width: 140px;
      height: auto;
      display: block;
    }
    .instructions {
      background-color: #e8f0fe;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid #1a73e8;
    }
    .instructions h3 {
      margin-top: 0;
      color: #1a73e8;
      font-size: 17px;
    }
    .footer {
      text-align: center;
      padding-top: 18px;
      border-top: 1px solid #eaeaea;
      color: #888;
      font-size: 13px;
    }
    .button {
      display: inline-block;
      background-color: #1a73e8;
      color: #fff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 5px;
      margin-top: 18px;
      font-weight: bold;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(26,115,232,0.08);
    }
    a {
      color: #1a73e8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Smart Parking Reservation Confirmed</h1>
    </div>
    <div class="content">
      <p class="greeting">Dear ${booking.name},</p>
      <p>
        We are pleased to inform you that your parking reservation has been <b>successfully confirmed</b>.<br>
        Please find your booking details below.
      </p>
      <div class="booking-details">
        <h2>Reservation Details</h2>
        <div class="detail-row">
          <div class="detail-label">Booking ID:</div>
          <div class="detail-value">${booking.id}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">RFID Tag ID:</div>
          <div class="detail-value">${booking.rfIdTagId}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Start Time:</div>
          <div class="detail-value">${booking.startTime}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">End Time:</div>
          <div class="detail-value">${booking.endTime}</div>
        </div>
      </div>

      <div class="instructions">
        <h3>📌 Important Instructions</h3>
        <ol>
          <li>Arrive within 15 minutes of your scheduled start time</li>
          <li>Hold your RFID tag near the reader at the entrance</li>
          <li>Park only in your assigned spot</li>
          <li>Late returns incur N$5/15min after reservation period</li>
        </ol>
      </div>

      <p style="margin-top: 24px;">
        Need assistance? Reply to this email or call our support team at <br>
        <a href="tel:+264812354555">+264812354555</a>
      </p>
    </div>

    <div class="footer">
      <p>© 2024 Smart Parking Solutions. All rights reserved.</p>
      <p style="margin: 6px 0;">
        <a href="#">Privacy Policy</a> | 
        <a href="#">Terms of Service</a> | 
        <a href="#">Parking Regulations</a>
      </p>
      <p>16,Indepedance Avenue, Windhoek</p>
    </div>
  </div>
</body>
</html>
        `,
      });
      this.logger.log(`Booking confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email to ${to}: ${error.message}`,
      );
    }
  }
}
