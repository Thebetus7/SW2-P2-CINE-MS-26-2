import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Badge visual para mostrar el contador de aforo de sala en la interfaz del portero.
class AttendanceCounterBadge extends StatelessWidget {
  final int count;
  final String roomName;

  const AttendanceCounterBadge({
    super.key,
    required this.count,
    this.roomName = 'Sala 1',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.people_alt_rounded,
            color: AppTheme.accentGold,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            '$roomName • Ingresos: $count',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
