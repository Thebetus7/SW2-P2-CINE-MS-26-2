import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../features/gatekeeper/bloc/scanner_state.dart';

/// Notificación simple y concisa en banner superior para el portero
/// Provee retroalimentación visual inmediata ("Acceso Permitido — Sala X" o "Boleto Ya Utilizado")
class SimpleConfirmationBanner extends StatelessWidget {
  final ScanFeedbackType feedbackType;
  final String message;
  final VoidCallback onDismiss;

  const SimpleConfirmationBanner({
    super.key,
    required this.feedbackType,
    required this.message,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isSuccess = feedbackType == ScanFeedbackType.permitted;
    final bgColor = isSuccess ? AppTheme.statusOnline : AppTheme.statusOffline;
    final iconData = isSuccess ? Icons.check_circle_rounded : Icons.cancel_rounded;

    return Material(
      color: Colors.transparent,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: bgColor.withOpacity(0.5),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              iconData,
              color: Colors.white,
              size: 28,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isSuccess ? 'VALIDACIÓN EXITOSA' : 'ACCESO DENEGADO',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.white70,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    message,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close_rounded, color: Colors.white70),
              onPressed: onDismiss,
              tooltip: 'Continuar escaneo',
            ),
          ],
        ),
      ),
    );
  }
}
