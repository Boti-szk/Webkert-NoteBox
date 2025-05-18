//felhasználókat defiiáló interface
import { Note } from "./Note";

export interface User {
  id: string
    name: {
      firstname: string;
      lastname: string;
    };
    email: string;
    notes: string[];
}