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
      photo_url: z.string().optional()
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
      reporter_photo_url: z.string().url().optional(),
      incident_photo_url: z.string().url().optional(),
      reported_person: z.string().optional(),
      complaint_details: z.string().min(10)
    })
  }),

  createAnnouncement: z.object({
    body: z.object({
      title: z.string().min(5).max(255),
      content: z.string().min(10)
    })
  })
};
