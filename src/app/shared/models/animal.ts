export class Animal {
    _id?: string;
    ownerId: { _id: string; name: string; email: string };
    name: string;
    species: string;
    birthDate: string;
    icon:string;
  }