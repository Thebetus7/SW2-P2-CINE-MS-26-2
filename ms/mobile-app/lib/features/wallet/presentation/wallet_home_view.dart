import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/active_module_badge.dart';
import '../bloc/wallet_bloc.dart';
import '../bloc/wallet_event.dart';
import '../bloc/wallet_state.dart';
import 'ticket_detail_view.dart';

/// Pantalla "Mis Boletos" (ROLE_CUSTOMER)
/// Despliega el listado de entradas adquiridas disponibles localmente en SQLite
class WalletHomeView extends StatefulWidget {
  final SqliteWalletDb? database;
  final String customerEmail;

  const WalletHomeView({
    super.key,
    this.database,
    this.customerEmail = 'cliente@test.com',
  });

  @override
  State<WalletHomeView> createState() => _WalletHomeViewState();
}

class _WalletHomeViewState extends State<WalletHomeView> {
  late final WalletBloc _bloc;

  @override
  void initState() {
    super.initState();
    _bloc = WalletBloc(database: widget.database ?? SqliteWalletDb())
      ..add(LoadCustomerTicketsEvent(widget.customerEmail));
  }

  @override
  void dispose() {
    _bloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Mis Boletos'),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: () => _bloc.add(RefreshWalletEvent(widget.customerEmail)),
              tooltip: 'Actualizar boletos',
            ),
            const Padding(
              padding: EdgeInsets.only(right: 12.0),
              child: ActiveModuleBadge(),
            ),
          ],
        ),
        body: BlocBuilder<WalletBloc, WalletState>(
          builder: (context, state) {
            if (state is WalletLoading) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.primaryRed));
            }

            if (state is WalletError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppTheme.statusOffline, size: 48),
                      const SizedBox(height: 12),
                      Text(state.message, style: const TextStyle(color: AppTheme.textPrimary)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => _bloc.add(RefreshWalletEvent(widget.customerEmail)),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              );
            }

            if (state is WalletEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.confirmation_number_outlined, color: AppTheme.textMuted, size: 64),
                    const SizedBox(height: 16),
                    const Text(
                      'No tienes boletos disponibles',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tus entradas compradas se almacenan automáticamente aquí.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => _bloc.add(LoadCustomerTicketsEvent(widget.customerEmail)),
                      child: const Text('Cargar Boletos Semilla'),
                    ),
                  ],
                ),
              );
            }

            if (state is WalletLoaded) {
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.tickets.length,
                itemBuilder: (context, index) {
                  final ticket = state.tickets[index];
                  return _buildTicketCard(context, ticket);
                },
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildTicketCard(BuildContext context, LocalTicket ticket) {
    final isUsed = ticket.status == 'USED';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isUsed ? AppTheme.borderDark : AppTheme.primaryRed.withOpacity(0.5),
          width: 1.5,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => TicketDetailView(ticket: ticket),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16.0),
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
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isUsed
                            ? AppTheme.statusOffline.withOpacity(0.15)
                            : AppTheme.statusOnline.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        isUsed ? 'USADO' : 'LISTO PARA ENTRAR',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isUsed ? AppTheme.statusOffline : AppTheme.statusOnline,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.meeting_room_rounded, size: 16, color: AppTheme.accentGold),
                    const SizedBox(width: 6),
                    Text(ticket.roomName, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(width: 14),
                    const Icon(Icons.access_time_rounded, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 6),
                    Text(ticket.showtime, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.event_seat_rounded, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 6),
                    Text('Asientos: ${ticket.seats}', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: AppTheme.borderDark),
                const SizedBox(height: 10),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.qr_code_rounded, color: AppTheme.primaryRed, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'Ver QR Llave y Confitería',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryRed,
                          ),
                        ),
                      ],
                    ),
                    Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppTheme.textMuted),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
