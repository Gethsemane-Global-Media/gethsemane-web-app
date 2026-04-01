
export enum AuthView {
  SIGN_IN,
  SIGN_UP,
  SUCCESS,
  SIGN_IN_EMAIL,
  SIGN_UP_EMAIL,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_SENT,
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  type: 'community' | 'user';
  details: {
    duration: string;
    ends: string;
    chaptersPerDay: number;
    books: string[];
  };
  startDate?: Date;
  progress?: number;
}

export interface Note {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  noteId?: string; // Optional link to a note
}
