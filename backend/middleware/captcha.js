import axios from 'axios';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SECRET_KEY = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

/**
 * Middleware to verify Google reCAPTCHA v2 or v3 token
 * For v2: Checks if checkbox was completed
 * For v3: Checks if token is valid and score is above threshold
 */
export async function verifyCaptcha(req, res, next) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const { recaptcha_token, recaptcha_verified } = req.body;

    // If recaptcha_verified flag is true, it means v2 checkbox was completed on client
    if (recaptcha_verified === true) {
      req.captcha = { verified: true };
      return next();
    }

    // Otherwise, proceed with token verification (v3 or v2 with token)
    if (!recaptcha_token) {
      if (!isProduction) {
        console.warn('reCAPTCHA token missing in non-production. Skipping verification.');
        req.captcha = { verified: false, skipped: true, reason: 'missing_token_non_production' };
        return next();
      }
      return res.status(400).json({ error: 'reCAPTCHA verification required' });
    }

    if (!RECAPTCHA_SECRET_KEY) {
      if (!isProduction) {
        console.warn('Google reCAPTCHA secret key not configured in non-production. Skipping verification.');
        req.captcha = { verified: false, skipped: true, reason: 'missing_secret_non_production' };
        return next();
      }
      return res.status(500).json({ error: 'reCAPTCHA is not configured on the server' });
    }

    // Verify token with Google
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptcha_token,
      },
    });

    const { success, score, action, challenge_ts, hostname, error_codes } = response.data;

    if (!success) {
      console.warn('reCAPTCHA verification failed:', error_codes);
      if (!isProduction) {
        req.captcha = { verified: false, skipped: true, reason: 'verification_failed_non_production' };
        return next();
      }
      return res.status(400).json({
        error: 'reCAPTCHA verification failed. Please try again.',
        details: error_codes,
      });
    }

    // For v3, check score threshold
    if (score !== undefined) {
      const SCORE_THRESHOLD = 0.5;
      if (score < SCORE_THRESHOLD) {
        console.warn(`reCAPTCHA score too low: ${score} (threshold: ${SCORE_THRESHOLD})`);
        if (!isProduction) {
          req.captcha = {
            verified: false,
            skipped: true,
            reason: 'low_score_non_production',
            score,
          };
          return next();
        }
        return res.status(400).json({
          error: 'reCAPTCHA validation failed. Your request appears automated. Please try again.',
        });
      }
    }

    // Attach verification details to request for logging if needed
    req.captcha = {
      verified: true,
      score,
      action,
      challenge_ts,
      hostname,
    };

    next();
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    // Don't block request if Google API fails, but log the error
    req.captcha = {
      verified: false,
      error: error.message,
    };
    next();
  }
}

/**
 * Verify CAPTCHA token manually (for custom endpoints)
 * Returns verification result or throws error
 */
export async function verifyToken(token) {
  if (!token) {
    throw new Error('reCAPTCHA token is required');
  }

  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('Google reCAPTCHA secret key not configured. Skipping verification.');
    return { verified: true, skipped: true };
  }

  try {
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    const { success, score } = response.data;
    const SCORE_THRESHOLD = 0.5;

    if (!success || score < SCORE_THRESHOLD) {
      throw new Error('reCAPTCHA verification failed');
    }

    return { verified: true, score };
  } catch (error) {
    throw error;
  }
}

export default {
  verifyCaptcha,
  verifyToken,
};
