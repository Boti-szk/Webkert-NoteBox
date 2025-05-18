import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, getDoc, where } from '@angular/fire/firestore';
import { Observable, from, switchMap, map, of, take, firstValueFrom } from 'rxjs';
import { Note } from '../models/Note';
import { AuthService } from './auth.service';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly NOTES_COLLECTION = 'Notes';
  private readonly USERS_COLLECTION = 'Users';

  constructor(
    private authService: AuthService,
    private firestore: Firestore
  ) { }

  private formatDateToString(date: Date | string): string {
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.includes('T') ? date.split('T')[0] : date;
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }

  // CREATE
  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const notesCollection = collection(this.firestore, this.NOTES_COLLECTION);
      
      const noteToSave = {
        ...note,
        createdAt: this.formatDateToString(note.createdAt as string)
      };
      
      const docRef = await addDoc(notesCollection, noteToSave);
      const noteId = docRef.id;
      
      await updateDoc(docRef, { id: noteId });
      
      const newNote = {
        ...noteToSave,
        id: noteId
      } as Note;

      // Felhasználó notes tömbjének frissítése
      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const notes = userData.notes || [];
        notes.push(noteId);
        await updateDoc(userDocRef, { notes });
      }

      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // READ
  getAllNotes(): Observable<Note[]> {
    return this.authService.currentUser.pipe(
      switchMap(async user => {
        if (!user) {
          return of([]);
        }
        try {
          const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            return of([]);
          }
          const userData = userDoc.data() as User;
          const noteIds = userData.notes || [];
          if (noteIds.length === 0) {
            return of([]);
          }

          const notesCollection = collection(this.firestore, this.NOTES_COLLECTION);
          const notes: Note[] = [];
          const batchSize = 10;

          for (let i = 0; i < noteIds.length; i += batchSize) {
            const batch = noteIds.slice(i, i + batchSize);
            const q = query(notesCollection, where('__name__', 'in', batch));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
              notes.push({ ...doc.data(), id: doc.id } as Note);
            });
          }

          return of(notes.sort((a, b) => {
            return a.createdAt.localeCompare(b.createdAt);
          }));
        } catch (error) {
          console.error('Error fetching notes:', error);
          return of([]);
        }
      }),
      switchMap(notes => notes)
    );
  }

  getCompletedNotes(): Observable<Note[]> {
    return this.getAllNotes().pipe(
      map(notes => notes.filter(note => note.completed))
    );
  }

  async getNoteById(noteId: string): Promise<Note | null> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) {
        return null;
      }
      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        return null;
      }
      const userData = userDoc.data() as User;
      if (!userData.notes || !userData.notes.includes(noteId)) {
        return null;
      }

      const noteDocRef = doc(this.firestore, this.NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteDocRef);
      if (noteSnapshot.exists()) {
        return { ...noteSnapshot.data(), id: noteId } as Note;
      }
      return null;
    } catch (error) {
      console.error('Error fetching note:', error);
      return null;
    }
  }

  // UPDATE
  async updateNote(noteId: string, updatedData: Partial<Note>): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) {
        throw new Error('No authenticated user found');
      }
      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      const userData = userDoc.data() as User;
      if (!userData.notes || !userData.notes.includes(noteId)) {
        throw new Error('Note does not belong to the user');
      }

      const dataToUpdate: any = { ...updatedData };
      if (dataToUpdate.createdAt) {
        dataToUpdate.createdAt = this.formatDateToString(dataToUpdate.createdAt as any);
      }

      const noteDocRef = doc(this.firestore, this.NOTES_COLLECTION, noteId);
      return updateDoc(noteDocRef, dataToUpdate);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  toggleNoteCompletion(noteId: string, completed: boolean): Promise<void> {
    return this.updateNote(noteId, { completed });
  }

  // DELETE
  async deleteNote(noteId: string): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) {
        throw new Error('No authenticated user found');
      }
      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      const userData = userDoc.data() as User;
      if (!userData.notes || !userData.notes.includes(noteId)) {
        throw new Error('Note does not belong to the user');
      }

      const noteDocRef = doc(this.firestore, this.NOTES_COLLECTION, noteId);
      await deleteDoc(noteDocRef);

      const updatedNotes = userData.notes.filter(id => id !== noteId);
      return updateDoc(userDocRef, { notes: updatedNotes });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async clearCompletedNotes(): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Felhasználó adatainak lekérése
      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;
      const notes = await firstValueFrom(this.getAllNotes());
      const completedNotes = notes.filter(note => note.completed);
      
      if (completedNotes.length === 0) {
        return;
      }
      
      const completedNoteIds = completedNotes.map(note => note.id);
      
      const updatedNotes = userData.notes.filter(id => !completedNoteIds.includes(id));
      await updateDoc(userDocRef, { notes: updatedNotes });
      
      const deletePromises = completedNotes.map(note => {
        const noteDocRef = doc(this.firestore, this.NOTES_COLLECTION, note.id);
        return deleteDoc(noteDocRef);
      });
      
      return Promise.all(deletePromises).then(() => {});
    } catch (error) {
      console.error('Error clearing completed notes:', error);
      throw error;
    }
  }

  // ÖSSZETETT LEKÉRDEZÉSEK valódi Firebase query-kkel
  // Segédfüggvény a felhasználó feladat ID-inak lekérdezéséhez
  private async getUserNoteIds(userId: string): Promise<string[]> {
    const userDocRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as User;
    return userData.notes || [];
  }
}
