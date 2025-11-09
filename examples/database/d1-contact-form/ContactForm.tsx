/**
 * Contact Form Component
 *
 * A complete React component for submitting and managing contacts.
 * Includes form validation, API integration, and contact list display.
 *
 * Usage:
 * import ContactForm from './examples/database/d1-contact-form/ContactForm';
 *
 * function App() {
 *   return <ContactForm />;
 * }
 */

import { useState, useEffect, FormEvent } from 'react';
import type { Contact, ContactListResponse, ContactResponse, ErrorResponse } from './types';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Contact list state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch all contacts
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    setContactsError(null);

    try {
      const response = await fetch('/api/contacts');
      const data: ContactListResponse | ErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Convert date strings to Date objects
      const contactsWithDates = data.data.map((contact) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
      }));

      setContacts(contactsWithDates);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContactsError(
        error instanceof Error ? error.message : 'Failed to load contacts'
      );
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ContactResponse | ErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      // Refresh contacts list
      await fetchContacts();

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit form'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contact deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Refresh contacts list
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to delete contact'
      );
    }
  };

  return (
    <div className="contact-form-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Contact Form</h1>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        {/* Name Field */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: errors.name ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: errors.email ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{errors.email}</p>
          )}
        </div>

        {/* Message Field */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: errors.message ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
            }}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {/* Success Message */}
        {submitSuccess && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
            }}
          >
            Contact submitted successfully!
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}
          >
            {submitError}
          </div>
        )}
      </form>

      {/* Contacts List */}
      <div>
        <h2>Submitted Contacts</h2>

        {isLoadingContacts && <p>Loading contacts...</p>}

        {contactsError && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            {contactsError}
          </div>
        )}

        {!isLoadingContacts && contacts.length === 0 && (
          <p>No contacts submitted yet.</p>
        )}

        {!isLoadingContacts && contacts.length > 0 && (
          <div>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <strong>Name:</strong> {contact.name}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Email:</strong> {contact.email}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Message:</strong> {contact.message}
                </div>
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                  <strong>Submitted:</strong> {contact.createdAt.toLocaleString()}
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
