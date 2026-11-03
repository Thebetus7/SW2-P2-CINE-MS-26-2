import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Badge visual para identificar el módulo autónomo activo en el AppBar.
class ActiveModuleBadge extends StatelessWidget {
  final String label;

  const ActiveModuleBadge({
    super.key,
    this.label = 'MÓDULO 05: ms/mobile-app',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.primaryRed.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: AppTheme.primaryRed.withOpacity(0.4),
          width: 1,
        ),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppTheme.primaryRed,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
