package com.PFE.electroplanetaudit.service;

import com.PFE.electroplanetaudit.entity.User;
import com.PFE.electroplanetaudit.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendTwoFACode(String toEmail, String code, String userName, String device, String location, String ip) {
        try {
            Context context = new Context();
            context.setVariable("code", code);
            context.setVariable("userName", userName);
            context.setVariable("year", java.time.Year.now().getValue());
            context.setVariable("device", device);
            context.setVariable("location", location);
            context.setVariable("ip", ip);
            context.setVariable("expiryMinutes", 15);

            String htmlContent = templateEngine.process("email/2fa-code", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 ElectroPlanet Audit - Votre code de vérification");
            helper.setText(htmlContent, true);

            // Add logo as inline attachment (with try-catch to avoid failure)
            try {
                ClassPathResource logoResource = new ClassPathResource("static/images/logo.png");
                if (logoResource.exists()) {
                    helper.addInline("logoImage", logoResource);
                } else {
                    System.out.println("Logo file not found, continuing without logo");
                }
            } catch (Exception e) {
                System.out.println("Could not load logo: " + e.getMessage());
            }

            mailSender.send(message);
            System.out.println("2FA code sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendPasswordResetCode(String toEmail, String code, String userName, String ip) {
        try {
            Context context = new Context();
            context.setVariable("code", code);
            context.setVariable("userName", userName);
            context.setVariable("year", java.time.Year.now().getValue());
            context.setVariable("ip", ip);
            context.setVariable("expiryMinutes", 30);

            String htmlContent = templateEngine.process("email/reset-password-code", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 ElectroPlanet Audit - Réinitialisation de votre mot de passe");
            helper.setText(htmlContent, true);

            // Add logo as inline attachment (with try-catch to avoid failure)
            try {
                ClassPathResource logoResource = new ClassPathResource("static/images/logo.png");
                if (logoResource.exists()) {
                    helper.addInline("logoImage", logoResource);
                } else {
                    System.out.println("Logo file not found, continuing without logo");
                }
            } catch (Exception e) {
                System.out.println("Could not load logo: " + e.getMessage());
            }

            mailSender.send(message);
            System.out.println("Reset code sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
        }
    }
}