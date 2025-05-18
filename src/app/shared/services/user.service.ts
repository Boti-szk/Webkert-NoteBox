import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '../models/User';
import { Note } from '../models/Note';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  getUserProfile(): Observable<{
    user: User | null,
    notes: Note[],
    stats: {
      total: number,
      completed: number
    }
  }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({
            user: null,
            notes: [],
            stats: { total: 0, completed: 0 }
          });
        }
        return from(this.fetchUserWithNotes(authUser.uid));
      })
    );
  }

  private async fetchUserWithNotes(userId: string): Promise<{
    user: User | null,
    notes: Note[],
    stats: {
      total: number,
      completed: number
    }
  }> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        return {
          user: null,
          notes: [],
          stats: { total: 0, completed: 0 }
        };
      }

      const userData = userSnapshot.data() as User;
      const user = { ...userData, id: userId };

      if (!user.notes || user.notes.length === 0) {
        return {
          user,
          notes: [],
          stats: { total: 0, completed: 0 }
        };
      }

      const notesCollection = collection(this.firestore, 'Notes');
      const q = query(notesCollection, where('id', 'in', user.notes));
      const notesSnapshot = await getDocs(q);

      const notes: Note[] = [];
      notesSnapshot.forEach(doc => {
        notes.push({ ...doc.data(), id: doc.id } as Note);
      });

      const total = notes.length;
      const completed = notes.filter(note => note.completed).length;

      return {
        user,
        notes,
        stats: {
          total,
          completed
        }
      };
    } catch (error) {
      console.error('Hiba a felhasználói adatok betöltése során:', error);
      return {
        user: null,
        notes: [],
        stats: { total: 0, completed: 0 }
      };
    }
  }
}
