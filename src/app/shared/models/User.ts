//felhasználókat defiiáló interface
import { Note } from "./Note";

export interface User {
    name: {
      firstname: string;
      lastname: string;
    };
    email: string;
    password: string;
    notes: Note[];
  completed_notes: Note[];
}