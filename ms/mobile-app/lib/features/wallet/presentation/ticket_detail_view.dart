import 'package:flutter/material.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/active_module_badge.dart';
import 'qr_display_widget.dart';

/// Visor In-App de Boleto Cinematográfico (INV-BIZ-03)
/// Proyecta simultáneamente en pantalla el QR Llave (acceso) y el QR de Confitería (dulcería)
class TicketDetailView extends StatelessWidget {
  final LocalTicket ticket;

  const TicketDetailView({
    super.key,
    required this.ticket,
  });

  @override
  Widget build(BuildContext context) {
    final isUsed = ticket.status == 'USED';

    return Scaffold(
      appBar: AppBar(
        title: Text(ticket.movieTitle),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: ActiveModuleBadge(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Resumen de la función
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          ticket.movieTitle,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isUsed
                              ? AppTheme.statusOffline.withOpacity(0.2)
                              : AppTheme.statusOnline.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isUsed ? AppTheme.statusOffline : AppTheme.statusOnline,
                          ),
                        ),
                        child: Text(
                          isUsed ? 'UTILIZADO' : 'ACTIVO',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isUsed ? AppTheme.statusOffline : AppTheme.statusOnline,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: AppTheme.borderDark),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildInfoColumn('SALA', ticket.roomName, isAccent: true),
                      _buildInfoColumn('HORARIO', ticket.showtime),
                      _buildInfoColumn('BUTACAS', ticket.seats),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Ticket ID: ${ticket.ticketId}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 1. QR Llave de Acceso
            QrDisplayWidget(
              title: 'QR LLAVE DE ACCESO',
              subtitle: 'Apunta este código hacia el escáner del portero para ingresar a la sala',
              qrData: ticket.qrLlavePayload,
              accentColor: AppTheme.primaryRed,
              headerIcon: Icons.lock_open_rounded,
            ),
            const SizedBox(height: 20),

            // 2. QR de Confitería
            QrDisplayWidget(
              title: 'QR DE CONFITERÍA',
              subtitle: 'Presenta este código en el mostrador para retirar tus combos',
              qrData: ticket.qrCandyPayload,
              accentColor: AppTheme.accentGold,
              headerIcon: Icons.lunch_dining_rounded,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoColumn(String label, String value, {bool isAccent = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: isAccent ? AppTheme.accentGold : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
