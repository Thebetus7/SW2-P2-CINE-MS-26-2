import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/crypto/crypto_qr_verifier.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/router/role_router.dart';
import '../../../shared/widgets/active_module_badge.dart';
import '../../../shared/widgets/simple_confirmation_banner.dart';
import '../bloc/scanner_bloc.dart';
import '../bloc/scanner_event.dart';
import '../bloc/scanner_state.dart';
import 'attendance_counter_badge.dart';

/// Vista primaria obligatoria del Portero (ROLE_GATEKEEPER)
/// Abre directamente la interfaz de cámara para escaneo continuo y validación del QR Llave.
class CameraScannerView extends StatefulWidget {
  final SqliteWalletDb? database;
  final CryptoQrVerifier? verifier;
  final String roomName;

  const CameraScannerView({
    super.key,
    this.database,
    this.verifier,
    this.roomName = 'Sala 1 (IMAX)',
  });

  @override
  State<CameraScannerView> createState() => _CameraScannerViewState();
}

class _CameraScannerViewState extends State<CameraScannerView> {
  final TextEditingController _manualInputController = TextEditingController();
  late final ScannerBloc _bloc;

  @override
  void initState() {
    super.initState();
    _bloc = ScannerBloc(
      verifier: widget.verifier ?? CryptoQrVerifier(),
      database: widget.database ?? SqliteWalletDb(),
    )..add(LoadAttendanceCountEvent(roomName: widget.roomName));
  }

  @override
  void dispose() {
    _manualInputController.dispose();
    _bloc.close();
    super.dispose();
  }

  void _triggerScan(String payload) {
    if (payload.trim().isEmpty) return;
    _bloc.add(ScanQrCodeEvent(payload.trim()));
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          title: const Text('Control de Puerta'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () {
              Navigator.of(context).pushReplacementNamed(AppRoutes.login);
            },
            tooltip: 'Cerrar sesión de portero',
          ),
          actions: const [
            Padding(
              padding: EdgeInsets.only(right: 12.0),
              child: ActiveModuleBadge(label: 'PORTERO ACTIVO'),
            ),
          ],
        ),
        body: BlocConsumer<ScannerBloc, ScannerState>(
          listener: (context, state) {
            // Si hay feedback, auto-reset a los 2.5s para continuar escaneando la fila
            if (state.feedbackType != ScanFeedbackType.none) {
              Future.delayed(const Duration(milliseconds: 2500), () {
                if (mounted) {
                  _bloc.add(const ResetScannerEvent());
                }
              });
            }
          },
          builder: (context, state) {
            return Stack(
              children: [
                // 1. Simulación visual del visor de cámara en tiempo real
                Positioned.fill(
                  child: Container(
                    color: const Color(0xFF070A10),
                    child: Center(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Recuadro del escáner
                          Container(
                            width: 260,
                            height: 260,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: state.feedbackType == ScanFeedbackType.permitted
                                    ? AppTheme.statusOnline
                                    : (state.feedbackType != ScanFeedbackType.none
                                        ? AppTheme.statusOffline
                                        : AppTheme.primaryRed),
                                width: 2.5,
                              ),
                            ),
                          ),
                          // Línea láser central animada
                          Container(
                            width: 240,
                            height: 2,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryRed,
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryRed.withOpacity(0.8),
                                  blurRadius: 8,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ),
                          if (state.isValidating)
                            const CircularProgressIndicator(color: AppTheme.primaryRed),
                        ],
                      ),
                    ),
                  ),
                ),

                // 2. Cabecera superior con contador de aforo
                Positioned(
                  top: 16,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: AttendanceCounterBadge(
                      count: state.attendanceCount,
                      roomName: widget.roomName,
                    ),
                  ),
                ),

                // 3. Banner simple de confirmación (Flotante)
                if (state.bannerMessage != null && state.feedbackType != ScanFeedbackType.none)
                  Positioned(
                    top: 60,
                    left: 0,
                    right: 0,
                    child: SimpleConfirmationBanner(
                      feedbackType: state.feedbackType,
                      message: state.bannerMessage!,
                      onDismiss: () => _bloc.add(const ResetScannerEvent()),
                    ),
                  ),

                // 4. Panel inferior de simulación de escaneo rápido
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceDark.withOpacity(0.95),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      border: const Border(top: BorderSide(color: AppTheme.borderDark)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Apunta la cámara al QR Llave o ingresa token de prueba:',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _manualInputController,
                                style: const TextStyle(fontSize: 12, color: Colors.white),
                                decoration: const InputDecoration(
                                  hintText: 'Pegar token CINELOCK:...',
                                  isDense: true,
                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              style: IconButton.styleFrom(
                                backgroundColor: AppTheme.primaryRed,
                                foregroundColor: Colors.white,
                              ),
                              onPressed: () {
                                _triggerScan(_manualInputController.text);
                                _manualInputController.clear();
                              },
                              icon: const Icon(Icons.qr_code_scanner, size: 20),
                              tooltip: 'Escanear manual',
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Atajo para escanear boleto semilla válido
                        OutlinedButton.icon(
                          onPressed: () {
                            final now = DateTime.now();
                            final validToken = CryptoQrVerifier.generateSignedPayload(
                              ticketId: 'TCK-CINE-8801',
                              roomName: widget.roomName,
                              expiresAt: now.add(const Duration(hours: 3)),
                            );
                            _triggerScan(validToken);
                          },
                          icon: const Icon(Icons.flash_on_rounded, size: 16, color: AppTheme.accentGold),
                          label: const Text(
                            'Simular Escaneo Boleto TCK-CINE-8801',
                            style: TextStyle(fontSize: 12),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.borderDark),
                            minimumSize: const Size.fromHeight(36),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
