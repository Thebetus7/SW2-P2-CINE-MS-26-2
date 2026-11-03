import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/database/local_seeder.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import 'wallet_event.dart';
import 'wallet_state.dart';

/// BLoC para la gestión del catálogo de boletos del cliente en la Billetera Móvil
class WalletBloc extends Bloc<WalletEvent, WalletState> {
  final SqliteWalletDb _database;

  WalletBloc({required SqliteWalletDb database})
      : _database = database,
        super(WalletLoading()) {
    on<LoadCustomerTicketsEvent>(_onLoadCustomerTickets);
    on<RefreshWalletEvent>(_onRefreshWallet);
  }

  Future<void> _onLoadCustomerTickets(
    LoadCustomerTicketsEvent event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      // Asegurar que existan datos semilla si la BD está vacía
      final seeder = LocalSeeder(_database);
      await seeder.seedIfEmpty();

      final tickets = await _database.getTicketsByCustomer(event.customerEmail);
      if (tickets.isEmpty) {
        emit(WalletEmpty());
      } else {
        emit(WalletLoaded(tickets));
      }
    } catch (e) {
      emit(WalletError('Error al recuperar boletos locales: $e'));
    }
  }

  Future<void> _onRefreshWallet(
    RefreshWalletEvent event,
    Emitter<WalletState> emit,
  ) async {
    try {
      final tickets = await _database.getTicketsByCustomer(event.customerEmail);
      if (tickets.isEmpty) {
        emit(WalletEmpty());
      } else {
        emit(WalletLoaded(tickets));
      }
    } catch (e) {
      emit(WalletError('Error al refrescar boletos: $e'));
    }
  }
}
