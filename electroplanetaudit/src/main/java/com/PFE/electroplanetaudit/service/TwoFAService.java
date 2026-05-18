package com.PFE.electroplanetaudit.service;

import com.PFE.electroplanetaudit.entity.TwoFACode;
import com.PFE.electroplanetaudit.entity.User;
import com.PFE.electroplanetaudit.repository.TwoFACodeRepository;
import com.PFE.electroplanetaudit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class TwoFAService {

    @Autowired
    private TwoFACodeRepository twoFACodeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    private static final SecureRandom random = new SecureRandom();
    private static final int CODE_EXPIRATION_MINUTES = 15;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    // ===== METHODS WITH IP & USER-AGENT (called from Controller) =====

    @Transactional
    public String generateAndSendLoginCode(String email, String clientIp, String userAgent) {
        return generateAndSendCode(email, "LOGIN", clientIp, userAgent);
    }

    @Transactional
    public String generateAndSendResetCode(String email, String clientIp, String userAgent) {
        return generateAndSendCode(email, "RESET_PASSWORD", clientIp, userAgent);
    }

    @Transactional
    public String resendLoginCode(String email, String clientIp, String userAgent) {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusSeconds(RESEND_COOLDOWN_SECONDS);
        TwoFACode recentCode = twoFACodeRepository
                .findTopByEmailAndTypeAndCreationTimeAfterOrderByCreationTimeDesc(email, "LOGIN", oneMinuteAgo);

        if (recentCode != null) {
            throw new RuntimeException("Please wait " + RESEND_COOLDOWN_SECONDS + " seconds before requesting another code.");
        }
        return generateAndSendCode(email, "LOGIN", clientIp, userAgent);
    }

    @Transactional
    public String resendResetCode(String email, String clientIp, String userAgent) {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusSeconds(RESEND_COOLDOWN_SECONDS);
        TwoFACode recentCode = twoFACodeRepository
                .findTopByEmailAndTypeAndCreationTimeAfterOrderByCreationTimeDesc(email, "RESET_PASSWORD", oneMinuteAgo);

        if (recentCode != null) {
            throw new RuntimeException("Please wait " + RESEND_COOLDOWN_SECONDS + " seconds before requesting another code.");
        }
        return generateAndSendCode(email, "RESET_PASSWORD", clientIp, userAgent);
    }

    // ===== LEGACY METHODS (for backward compatibility, if needed) =====

    @Transactional
    public String generateAndSendLoginCode(String email) {
        return generateAndSendCode(email, "LOGIN", null, null);
    }

    @Transactional
    public String generateAndSendResetCode(String email) {
        return generateAndSendCode(email, "RESET_PASSWORD", null, null);
    }

    @Transactional
    public String resendLoginCode(String email) {
        return resendLoginCode(email, null, null);
    }

    @Transactional
    public String resendResetCode(String email) {
        return resendResetCode(email, null, null);
    }

    // ===== GENERIC METHOD =====

    private String generateAndSendCode(String email, String type, String clientIp, String userAgent) {
        User user = userRepository.findByEmail(email).orElse(null);
        String userName = (user != null) ? user.getPrenom() + " " + user.getNom() : "Utilisateur";

        String device = extractDeviceInfo(userAgent);
        String location = getLocationFromIp(clientIp);

        twoFACodeRepository.deleteOldCodes(email, type, LocalDateTime.now());

        String code = String.format("%06d", random.nextInt(900000) + 100000);

        TwoFACode twoFACode = TwoFACode.builder()
                .email(email)
                .code(code)
                .type(type)
                .expiration(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES))
                .used(false)
                .creationTime(LocalDateTime.now())
                .build();
        twoFACodeRepository.save(twoFACode);

        if ("LOGIN".equals(type)) {
            emailService.sendTwoFACode(email, code, userName, device, location, clientIp);
        } else {
            emailService.sendPasswordResetCode(email, code, userName, clientIp);
        }

        return code;
    }

    // ===== VERIFICATION METHODS =====

    @Transactional
    public boolean verifyLoginCode(String email, String code) {
        return verifyCode(email, code, "LOGIN");
    }

    @Transactional
    public boolean verifyResetCode(String email, String code) {
        return verifyCode(email, code, "RESET_PASSWORD");
    }

    @Transactional
    public boolean verifyResetCodeOnly(String email, String code) {
        LocalDateTime now = LocalDateTime.now();
        return twoFACodeRepository
                .findByEmailAndCodeAndTypeAndUsedFalseAndExpirationAfter(email, code, "RESET_PASSWORD", now)
                .isPresent();
    }

    private boolean verifyCode(String email, String code, String type) {
        LocalDateTime now = LocalDateTime.now();
        return twoFACodeRepository
                .findByEmailAndCodeAndTypeAndUsedFalseAndExpirationAfter(email, code, type, now)
                .map(twoFACode -> {
                    twoFACode.setUsed(true);
                    twoFACodeRepository.save(twoFACode);
                    return true;
                })
                .orElse(false);
    }

    // ===== HELPER METHODS =====

    private String extractDeviceInfo(String userAgent) {
        if (userAgent == null) return "Navigateur web inconnu";
        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("windows")) return "Windows PC";
        if (userAgent.contains("mac")) return "Mac";
        if (userAgent.contains("linux")) return "Linux";
        if (userAgent.contains("android")) return "Android";
        if (userAgent.contains("iphone") || userAgent.contains("ipad")) return "iOS";
        if (userAgent.contains("chrome")) return "Google Chrome";
        if (userAgent.contains("firefox")) return "Mozilla Firefox";
        if (userAgent.contains("safari")) return "Safari";
        if (userAgent.contains("edge")) return "Microsoft Edge";

        return "Navigateur web";
    }

    private String getLocationFromIp(String ip) {
        if (ip == null || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return "Localhost";
        }
        // You can integrate with a geolocation API here
        return "Location inconnue";
    }
}