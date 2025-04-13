
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

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
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.scss']
})
export class NoteCreateComponent implements OnInit {
  noteForm: FormGroup;

  noteTypes: NoteType[] = ['Jegyzet', 'Teendő', 'Feladat', 'Egyéb'];

  constructor() {
    this.noteForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)]),
      text: new FormControl('', [Validators.required, Validators.minLength(10)]),
      type: new FormControl('Jegyzet', [Validators.required])
    });
  }

  ngOnInit(): void {}

  createNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    console.log("Új jegyzet:", this.noteForm.value);

    this.noteForm.reset({ type: 'Jegyzet' });
  }
}
