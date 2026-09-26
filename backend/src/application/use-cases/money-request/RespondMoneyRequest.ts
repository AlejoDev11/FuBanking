import { randomUUID } from 'node:crypto';
import { IMoneyRequestRepository } from '../../../domain/repositories/IMoneyRequestRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { MoneyRequest } from '../../../domain/entities/MoneyRequest';
import { Notification, NotificationType } from '../../../domain/entities/Notification';
import { AppError } from '../../../shared/errors/AppError';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';

export interface RespondMoneyRequestDto {
  userId: string;
  requestId: string;
  accept: boolean;
  accountId?: string;
}

export class RespondMoneyRequest {
  constructor(
    private readonly moneyRequestRepository: IMoneyRequestRepository,
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly notificationRepository?: INotificationRepository,
  ) {}

  async execute(dto: RespondMoneyRequestDto): Promise<MoneyRequest> {
    const request = await this.findRequest(dto.requestId);
    this.authorizeResponse(request, dto);

    if (dto.accept) {
      await this.payRequest(request, dto);
    }

    request.respond(dto.accept);
    const updated = await this.moneyRequestRepository.updateStatus(request.id, request.status);

    await this.notifyResponse(request, dto);

    return updated;
  }

  /** Busca la solicitud o falla con 404. */
  private async findRequest(requestId: string): Promise<MoneyRequest> {
    const request = await this.moneyRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError('La solicitud no existe', 404, 'REQUEST_NOT_FOUND');
    }
    return request;
  }

  /** Verifica permiso de respuesta y que el pago indique cuenta cuando se acepta. */
  private authorizeResponse(request: MoneyRequest, dto: RespondMoneyRequestDto): void {
    if (request.requestedUserId !== dto.userId) {
      throw new AppError('No tienes permiso para responder a esta solicitud', 403, 'FORBIDDEN');
    }
    if (dto.accept && !dto.accountId) {
      throw new AppError('Se requiere una cuenta para realizar el pago', 400, 'ACCOUNT_REQUIRED');
    }
  }

  /** Ejecuta el pago del cobro aceptado entre las cuentas operativas. */
  private async payRequest(request: MoneyRequest, dto: RespondMoneyRequestDto): Promise<void> {
    const senderAccount = await this.findSenderAccount(dto, request.amount);
    const receiverAccount = await this.findReceiverAccount(request);

    Transaction.validateDifferentAccounts(senderAccount.id, receiverAccount.id);

    const referenceNumber = Transaction.generateReferenceNumber();
    await this.transactionRepository.executeTransfer(
      senderAccount.id,
      receiverAccount.id,
      request.amount,
      `Pago de cobro: ${request.description ?? 'Sin concepto'}`,
      referenceNumber,
    );
  }

  /** Carga la cuenta de origen y valida propiedad, operatividad y saldo. */
  private async findSenderAccount(dto: RespondMoneyRequestDto, amount: number) {
    const senderAccount = await this.accountRepository.findById(dto.accountId as string);
    if (!senderAccount) {
      throw new AppError('La cuenta de origen no existe', 404, 'SENDER_ACCOUNT_NOT_FOUND');
    }
    senderAccount.assertBelongsTo(dto.userId);
    if (!senderAccount.isOperational()) {
      throw new AppError('La cuenta no está activa', 400, 'ACCOUNT_INACTIVE');
    }
    if (senderAccount.balance < amount) {
      throw new AppError('Saldo insuficiente para pagar el cobro', 400, 'INSUFFICIENT_FUNDS');
    }
    return senderAccount;
  }

  /** Carga la primera cuenta operativa del solicitante para recibir el pago. */
  private async findReceiverAccount(request: MoneyRequest) {
    const receiverAccounts = await this.accountRepository.findByUserId(request.requesterUserId);
    const receiverAccount = receiverAccounts.find((a) => a.isOperational());
    if (!receiverAccount) {
      throw new AppError('El solicitante no tiene cuentas activas para recibir el pago', 400, 'RECEIVER_ACCOUNT_NOT_FOUND');
    }
    return receiverAccount;
  }

  /** Notifica al solicitante sobre la respuesta, si hay repositorio disponible. */
  private async notifyResponse(request: MoneyRequest, dto: RespondMoneyRequestDto): Promise<void> {
    if (!this.notificationRepository) {
      return;
    }
    const responder = await this.userRepository.findById(dto.userId);
    const responderName = responder ? `${responder.firstName} ${responder.lastName}` : 'Alguien';
    const action = dto.accept ? 'aceptó' : 'rechazó';

    await this.notificationRepository.save(new Notification({
      id: randomUUID(),
      userId: request.requesterUserId,
      title: `Solicitud ${dto.accept ? 'aceptada' : 'rechazada'}`,
      message: `${responderName} ${action} tu solicitud de $${request.amount.toLocaleString('es-CO')}`,
      type: NotificationType.SOLICITUD_DINERO,
      read: false,
      createdAt: new Date(),
    }));
  }
}
