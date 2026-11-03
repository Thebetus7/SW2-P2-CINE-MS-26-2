export type ProjectionType = '2D' | '3D' | 'CXC' | 'VIP' | 'IMAX';

export class CinemaHall {
  constructor(
    public readonly id: string,
    public complexId: string,
    public name: string,
    public projectionType: ProjectionType,
    public totalCapacity: number,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
