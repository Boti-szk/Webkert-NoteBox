//jegyzeteket deffiniáló interface

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  completed: boolean;
}
