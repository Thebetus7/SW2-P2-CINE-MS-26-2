import 'package:equatable/equatable.dart';
import '../../../core/database/sqlite_wallet_db.dart';

abstract class WalletState extends Equatable {
  const WalletState();

  @override
  List<Object?> get props => [];
}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final List<LocalTicket> tickets;

  const WalletLoaded(this.tickets);

  @override
  List<Object?> get props => [tickets];
}

class WalletEmpty extends WalletState {}

class WalletError extends WalletState {
  final String message;

  const WalletError(this.message);

  @override
  List<Object?> get props => [message];
}
