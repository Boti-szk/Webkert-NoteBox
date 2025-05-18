import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { Note } from '../../shared/models/Note';
import { NoteService } from '../../shared/services/note.service';

export type NoteType = 'Jegyzet' | 'Teendő' | 'Feladat' | 'Egyéb';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule
  ],
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.scss']
})
export class NoteCreateComponent implements OnInit {
  noteForm: FormGroup;
  noteTypes: NoteType[] = ['Jegyzet', 'Teendő', 'Feladat', 'Egyéb'];

  constructor(
    private noteService: NoteService,
    private router: Router
  ) {
    this.noteForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)]),
      content: new FormControl('', [Validators.required, Validators.minLength(10)]),
      type: new FormControl('Jegyzet', [Validators.required])
    });
  }

  ngOnInit(): void {}

  createNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    const formValue = this.noteForm.value;

    const newNote: Omit<Note, 'id'> = {
      title: formValue.title,
      content: formValue.content,
      type: formValue.type,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.noteService.addNote(newNote)
      .then(() => this.router.navigate(['/notes']))
      .catch(err => console.error('Hiba jegyzet mentésekor:', err));
  }
}
