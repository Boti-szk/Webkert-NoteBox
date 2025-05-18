// src/app/pages/notes/notes.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { Note } from '../../shared/models/Note';
import { NoteService } from '../../shared/services/note.service';
import { ShorterTextPipe } from '../../shared/pipes/shorter-text.pipe';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule,
    ShorterTextPipe
  ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {
  allNotes: Note[] = [];
  completedNotes: Note[] = [];
  filteredNotes: Note[] = [];

  searchQuery = '';
  selectedType = 'Összes';

  isLoading = false;
  private subs: Subscription[] = [];

  constructor(
    private noteService: NoteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  private loadNotes(): void {
    this.isLoading = true;
    const sub = this.noteService.getAllNotes().subscribe({
      next: notes => {
        this.allNotes = notes;
        this.completedNotes = notes.filter(n => n.completed);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showMsg('Hiba a jegyzetek betöltésekor', 'error');
      }
    });
    this.subs.push(sub);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let notes = [...this.allNotes];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      notes = notes.filter(n => n.title.toLowerCase().includes(q));
    }
    if (this.selectedType && this.selectedType !== 'Összes') {
      notes = notes.filter(n => n.type === this.selectedType);
    }
    this.filteredNotes = notes;
  }

  toggleNoteCompletion(note: Note): void {
    this.isLoading = true;
    this.noteService.toggleNoteCompletion(note.id, !note.completed)
      .then(() => {
        this.showMsg(note.completed ? 'Jegyzet visszaállítva' : 'Jegyzet teljesítve', 'success');
        this.loadNotes();
      })
      .catch(() => this.showMsg('Hiba frissítéskor', 'error'))
      .finally(() => this.isLoading = false);
  }

  deleteNote(index: number): void {
    const note = this.filteredNotes[index];
    if (!note) {
      return;
    }
    if (!confirm('Biztos törölni akarod?')) {
      return;
    }
    this.isLoading = true;
    this.noteService.deleteNote(note.id)
      .then(() => {
        this.showMsg('Törölve', 'success');
        this.loadNotes();
      })
      .catch(() => this.showMsg('Hiba törléskor', 'error'))
      .finally(() => this.isLoading = false);
  }

  modifyNote(note: Note): void {
    this.router.navigate(['/note-create', note.id]);
  }

  changePage(): void {
    this.router.navigate(['/note-create']);
  }

  private showMsg(msg: string, type: 'success'|'error'|'warning'): void {
    this.snackBar.open(msg, 'Bezár', { duration: 3000, panelClass: [`snackbar-${type}`] });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
