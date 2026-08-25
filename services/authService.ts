const API_BASE_URL = import.meta.env.VITE_ROOTED_API_URL || 'http://localhost:8000/api/v1';

export interface StudentProfile {
  id: number;
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  waves?: Array<{
    id: number;
    name: string;
    cohort_year: number;
    school?: { name: string; code: string };
  }>;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  student?: StudentProfile | null;
}

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.message || (errData.errors ? Object.values(errData.errors).flat().join(' ') : 'Invalid credentials.');
    throw new Error(message);
  }

  const data = await response.json();
  return data.user;
};

export const loginWithGoogleApi = async (payload: {
  email: string;
  name: string;
  google_id?: string;
  avatar_url?: string;
}): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.message || 'Google authentication failed.';
    throw new Error(message);
  }

  const data = await response.json();
  return data.user;
};

export const registerUser = async (name: string, email: string, password: string): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.message || (errData.errors ? Object.values(errData.errors).flat().join(' ') : 'Registration failed.');
    throw new Error(message);
  }

  const data = await response.json();
  return data.user;
};

export const linkStudentAccount = async (
  userId: number,
  matricNumber: string,
  studentPassword: string
): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/link-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      matric_number: matricNumber,
      student_password: studentPassword,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to link student account.');
  }

  const data = await response.json();
  return data.user;
};
