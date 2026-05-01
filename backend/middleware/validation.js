import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
  };
};

// Validation schemas
export const schemas = {
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })
  }),

  createUser: z.object({
    body: z.object({
      full_name: z.string().min(2).max(255),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['admin', 'staff'])
    })
  }),

  updateUser: z.object({
    body: z.object({
      full_name: z.string().min(2).max(255).optional(),
      email: z.string().email().optional(),
      role: z.enum(['admin', 'staff']).optional(),
      status: z.enum(['active', 'disabled']).optional()
    }),
    params: z.object({
      id: z.string().uuid()
    })
  }),

  createHousehold: z.object({
    body: z.object({
      head_name: z.string().min(2).max(255),
      address: z.string().min(5),
      contact_number: z.string().optional(),
      civil_status: z.string().optional()
    })
  }),

  createFamilyMember: z.object({
    body: z.object({
      household_id: z.string().uuid(),
      full_name: z.string().min(2).max(255),
      age: z.number().int().positive().optional(),
      gender: z.string().optional(),
      relationship: z.string().optional()
    })
  }),

  createCertificateRequest: z.object({
    body: z.object({
      full_name: z.string().min(2).max(255),
      address: z.string().min(5),
      certificate_type: z.string().min(2),
      birth_date: z.string().optional(),
      age: z.union([z.number(), z.string()]).optional(),
      civil_status: z.string().optional(),
      purpose: z.string().optional(),
      contact_number: z.string().optional(),
      photo_url: z.string().optional(),
      purok_cert_url: z.string().url('Purok certification must be a valid URL'),
      sanitary_card_url: z.string().url('Sanitary card must be a valid URL'),
      recaptcha_token: z.string().min(1, 'reCAPTCHA token is required'),
      reporter_email: z.string().email('Valid email is required').optional(),
      package_code: z.string().optional()
    })
  }),

  createWalkInCertificateRequest: z.object({
    body: z.object({
      full_name: z.string().min(2).max(255),
      address: z.string().min(5),
      certificate_type: z.string().min(2),
      birth_date: z.string().optional(),
      age: z.union([z.number(), z.string()]).optional(),
      civil_status: z.string().optional(),
      purpose: z.string().optional(),
      contact_number: z.string().optional(),
      photo_url: z.string().optional(),
      profile_photo_url: z.string().optional(),
      purok_cert_url: z.string().url().optional(),
      sanitary_card_url: z.string().url().optional(),
      reporter_email: z.string().email().optional(),
      template_id: z.string().uuid().optional(),
      package_code: z.string().optional()
    })
  }),

  createBlotter: z.object({
    body: z.object({
      complainant_name: z.string().min(2).max(255),
      respondent_name: z.string().optional(),
      incident_details: z.string().min(10)
    })
  }),

  createComplaint: z.object({
    body: z.object({
      reporter_name: z.string().min(2).max(255),
      reporter_email: z.string().email('Valid email is required'),
      reporter_photo_url: z.string().url('Reporter photo must be a valid URL'),
      incident_photo_url: z.string().url().optional(),
      reported_person: z.string().optional(),
      complaint_details: z.string().min(10),
      recaptcha_token: z.string().min(1, 'reCAPTCHA token is required')
    })
  }),

  createAnnouncement: z.object({
    body: z.object({
      title: z.string().min(5).max(255),
      content: z.string().min(10),
      image_url: z.string().url().optional()
    })
  })
};
