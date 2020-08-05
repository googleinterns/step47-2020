// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.planet.servlets;

import java.io.IOException;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import javax.activation.DataHandler;
import javax.mail.Multipart;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.annotation.WebServlet;

@WebServlet("/send-itinerary-to-email")
public class SendEmailServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("alicexyz@google.com", "Alice Zhou"));
            //TODO: change this to the signed in user's email address
            message.addRecipient(Message.RecipientType.TO,
                            new InternetAddress("alicexyz@google.com"));
            //TODO: add custom subject, html body, and attached file
            message.setSubject("Your itinerary for Toronto trip");
            Multipart multipartContent = new MimeMultipart();

            // Add email body
            MimeBodyPart htmlPart = new MimeBodyPart();
            String htmlBody = "<div>Hello! <h3> Thank you for using Planet.</h3> " +
                "<h3>You can see a copy of your itinerary in the attachment below.</h3></div>";  
            htmlPart.setContent(htmlBody, "text/html");
            multipartContent.addBodyPart(htmlPart);

            // Add a pdf attachment of the itinerary
            // TODO: change input to actual itinerary
            MimeBodyPart attachment = new MimeBodyPart();
            String itinerary = "your itinerary";
            InputStream attachmentDataStream = new ByteArrayInputStream(itinerary.getBytes("UTF-16"));
            attachment.setFileName("itinerary.pdf");
            attachment.setContent(attachmentDataStream, "application/pdf");
            multipartContent.addBodyPart(attachment);

            message.setContent(multipartContent);
            Transport.send(message);
        } catch (MessagingException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println(e.getMessage());
        } catch (UnsupportedEncodingException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println(e.getMessage());
        } 
    }
}
