//jegyzeteket deffiniáló interface

export interface Note {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  type: string;
  createdAt: string;
}
