import { CreateHallModalComponent, NewHallData, ProjectionType } from './create-hall-modal.component';

export interface HallItem {
  id: string;
  complexId: string;
  name: string;
  projectionType: ProjectionType;
  totalCapacity: number;
  isActive: boolean;
}

export class HallsListComponent {
  public currentComplexId: string = 'complex-central-01';
  public isModalOpen: boolean = false;
  public successMessage: string = '';

  public halls: HallItem[] = [
    { id: 'hall-c1-01', complexId: 'complex-central-01', name: 'Sala 1 - MacroXE', projectionType: 'CXC', totalCapacity: 24, isActive: true },
    { id: 'hall-c1-02', complexId: 'complex-central-01', name: 'Sala 2 - 3D RealD', projectionType: '3D', totalCapacity: 20, isActive: true },
    { id: 'hall-c2-01', complexId: 'complex-norte-02', name: 'Sala VIP Platinum', projectionType: 'VIP', totalCapacity: 20, isActive: true },
    { id: 'hall-c2-02', complexId: 'complex-norte-02', name: 'Sala IMAX Laser', projectionType: 'IMAX', totalCapacity: 20, isActive: true },
  ];

  public openCreateModal(): void {
    this.isModalOpen = true;
  }

  public closeModal(): void {
    this.isModalOpen = false;
  }

  public handleSaveHall(data: NewHallData): void {
    const newId = `hall-${Date.now().toString().slice(-4)}`;
    this.halls.push({
      id: newId,
      complexId: data.complexId,
      name: data.name,
      projectionType: data.projectionType,
      totalCapacity: data.totalCapacity,
      isActive: true,
    });
    this.isModalOpen = false;
    this.successMessage = `¡Sala "${data.name}" (${data.projectionType}) creada con éxito con ${data.totalCapacity} butacas!`;
  }
}
