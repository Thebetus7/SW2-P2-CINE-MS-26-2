import 'package:flutter/material.dart';
import '../../core/network/api_health_service.dart';
import '../../core/theme/app_theme.dart';

/// Chip de semáforo de red para el AppBar o cabecera de la aplicación.
/// Refleja visualmente si el sistema está conectado al backend o si opera localmente en SQLite.
class HealthIndicatorChip extends StatelessWidget {
  final ApiHealthState state;
  final VoidCallback? onRetry;

  const HealthIndicatorChip({
    super.key,
    required this.state,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    Color dotColor;
    String label;

    switch (state) {
      case ApiHealthState.online:
        dotColor = AppTheme.statusOnline;
        label = 'Online';
        break;
      case ApiHealthState.offline:
        dotColor = AppTheme.statusOffline;
        label = 'Offline (Local)';
        break;
      case ApiHealthState.checking:
        dotColor = AppTheme.statusWarning;
        label = 'Verificando...';
        break;
    }

    return InkWell(
      onTap: onRetry,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: dotColor.withOpacity(0.5),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: dotColor.withOpacity(0.6),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: dotColor,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
