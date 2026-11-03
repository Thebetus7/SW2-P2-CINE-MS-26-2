export class CinemaComplex {
  constructor(
    public readonly id: string,
    public name: string,
    public city: string,
    public address: string,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
