// permission.type.ts
export interface Permission {
  id: number;
  name: string;
  group: string;
  checked?: boolean;  // Optional for frontend selection logic
  description: string;
}
