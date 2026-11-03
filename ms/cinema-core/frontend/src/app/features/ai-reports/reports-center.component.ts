import { ReportsFilterBarComponent, ReportFilterCriteria } from './reports-filter-bar.component';
import { ReportResultsTableComponent, ReportRowData } from './report-results-table.component';

export interface OneClickCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  type: 'revenue' | 'occupancy' | 'candy' | 'ai_prediction';
}

export class ReportsCenterComponent {
  public filterBar: ReportsFilterBarComponent = new ReportsFilterBarComponent();
  public resultsTable: ReportResultsTableComponent = new ReportResultsTableComponent();

  public isListening: boolean = false;
  public transcriptResult: string = '';
  public aiAssistantMessage: string = '';
  public currentReportTitle: string = 'Recaudación Consolidada por Complejo y Sala';

  public oneClickCards: OneClickCard[] = [
    {
      id: 'card-rev',
      title: 'Recaudación por Complejo',
      subtitle: 'Ingresos de taquilla y ticket promedio por sala',
      badge: 'Financiero',
      icon: 'dollar-sign',
      type: 'revenue',
    },
    {
      id: 'card-occ',
      title: 'Ocupación & Horarios Pico',
      subtitle: 'Aforos promedio y butacas vacías por tanda',
      badge: 'Operaciones',
      icon: 'users',
      type: 'occupancy',
    },
    {
      id: 'card-candy',
      title: 'Confitería vs. Boletos',
      subtitle: 'Ratio de conversión y consumo de snacks',
      badge: 'Ventas',
      icon: 'popcorn',
      type: 'candy',
    },
    {
      id: 'card-ai',
      title: 'Predicción IA de Demanda',
      subtitle: 'Proyección de ventas fin de semana con LLM',
      badge: 'IA Predictiva',
      icon: 'brain-circuit',
      type: 'ai_prediction',
    },
  ];

  selectOneClickCard(card: OneClickCard): void {
    this.filterBar.setReportType(card.type);
    this.currentReportTitle = card.title;
    this.aiAssistantMessage = `Generando reporte inteligente: "${card.title}" con parámetros óptimos.`;
  }

  toggleVoiceAssistant(): void {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.aiAssistantMessage = 'Escuchando comando de voz... Diga por ejemplo: "Reporte de ocupación" o "Descargar ventas".';
    } else {
      this.aiAssistantMessage = 'Micrófono desactivado.';
    }
  }

  processVoiceCommand(spokenText: string): string {
    const clean = spokenText.toLowerCase();
    this.transcriptResult = spokenText;
    this.isListening = false;

    if (clean.includes('ocupación') || clean.includes('aforo')) {
      this.selectOneClickCard(this.oneClickCards[1]);
      this.aiAssistantMessage = 'Comando reconocido: Mostrando reporte de Ocupación y Horarios Pico.';
      return 'OCCUPANCY_REPORT';
    }

    if (clean.includes('confitería') || clean.includes('snack') || clean.includes('candy')) {
      this.selectOneClickCard(this.oneClickCards[2]);
      this.aiAssistantMessage = 'Comando reconocido: Mostrando reporte de Auditoría de Confitería.';
      return 'CANDY_REPORT';
    }

    if (clean.includes('ia') || clean.includes('predicción') || clean.includes('inteligencia')) {
      this.selectOneClickCard(this.oneClickCards[3]);
      this.aiAssistantMessage = 'Comando reconocido: Consultando agente IA para proyección de demanda.';
      return 'AI_PREDICTION_REPORT';
    }

    if (clean.includes('descargar') || clean.includes('excel')) {
      const result = this.resultsTable.triggerExcelDownload();
      this.aiAssistantMessage = `Comando reconocido: Generando y descargando archivo "${result.filename}".`;
      return 'EXCEL_DOWNLOAD';
    }

    this.selectOneClickCard(this.oneClickCards[0]);
    this.aiAssistantMessage = `Comando procesado: "${spokenText}". Mostrando reporte financiero general.`;
    return 'REVENUE_REPORT';
  }
}
