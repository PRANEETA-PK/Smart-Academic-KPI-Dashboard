export type Role = "student" | "faculty" | "admin";

export interface Subject {
  subjectName: string;
  marks: number;
}

export interface Semester {
  semesterName: string;
  sgpa: number;
  subjects: Subject[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  attendance: number;
  cgpa: number;
  semesters: Semester[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
