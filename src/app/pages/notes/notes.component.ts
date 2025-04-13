import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NOTES_DATA, Note, NoteType } from '../../shared/notes_constant';
import { ShorterTextPipe } from '../../shared/pipes/shorter-text.pipe';


@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    ShorterTextPipe
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {

  constructor(private router: Router) {}

  // Az összes jegyzet, és a szűrt jegyzetek tárolása
  allNotes: Note[] = [];
  filteredNotes: Note[] = [];
  
  // Szűrési paraméterek:
  searchQuery: string = '';
  selectedType: NoteType | 'Összes' = 'Összes';

  ngOnInit(): void {
    // Betöltjük a konstans adatot:
    this.allNotes = [...NOTES_DATA];
    this.filteredNotes = [...this.allNotes];
  }

  // Szűrjük a jegyzeteket a keresési kifejezés és a típus alapján
  filterNotes(): void {
    this.filteredNotes = this.allNotes.filter(note => {
      const matchesQuery = note.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = this.selectedType === 'Összes' || note.type === this.selectedType;
      return matchesQuery && matchesType;
    });
  }

  // Figyeljük a szöveges keresést:
  onSearchChange(): void {
    this.filterNotes();
  }

  // A típus szűrésének változásakor:
  onTypeChange(): void {
    this.filterNotes();
  }

  // Már meglévő funkciók: a befejezés, módosítás, törlés
  toggleNoteCompletion(note: Note): void {
    note.completed = !note.completed;
  }

  modifyNote(note: Note): void {
    console.log('Modify Note:', note);
  }

  deleteNote(index: number): void {
    this.allNotes.splice(index, 1);
    this.filterNotes();
  }

  changePage() {
    this.router.navigateByUrl("/note-create");
  }
}
