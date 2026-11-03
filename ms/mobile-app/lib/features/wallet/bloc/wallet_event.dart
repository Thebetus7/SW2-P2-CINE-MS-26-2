import 'package:equatable/equatable.dart';

abstract class WalletEvent extends Equatable {
  const WalletEvent();

  @override
  List<Object?> get props => [];
}

class LoadCustomerTicketsEvent extends WalletEvent {
  final String customerEmail;

  const LoadCustomerTicketsEvent(this.customerEmail);

  @override
  List<Object?> get props => [customerEmail];
}

class RefreshWalletEvent extends WalletEvent {
  final String customerEmail;

  const RefreshWalletEvent(this.customerEmail);

  @override
  List<Object?> get props => [customerEmail];
}
