import { expect as assert } from '@assertive-ts/core';
import { describe, test, beforeEach, vi, expect } from 'vitest';
import { WithdrawMoney } from '../../../application/use-cases/account/WithdrawMoney';
import { Account, AccountStatus, AccountType } from '../../../domain/entities/Account';
import { AppError } from '../../../shared/errors/AppError';

describe('WithdrawMoney - Casos de uso de Retiro', () => {
  let withdrawMoney: WithdrawMoney;
  let mockAccountRepo: any;
  let mockNotificationRepo: any;

  beforeEach(() => {
    mockAccountRepo = {
      findById: vi.fn(),
      updateBalance: vi.fn(),
    };
    mockNotificationRepo = {
      save: vi.fn(),
    };
    withdrawMoney = new WithdrawMoney(mockAccountRepo, mockNotificationRepo);
  });

  const createMockAccount = (balance: number, status: AccountStatus, userId = 'user123') => {
    return new Account({
      id: 'acc123',
      userId,
      accountNumber: 'BA1000000000',
      accountType: AccountType.AHORROS,
      balance,
      status,
      details: null,
      createdAt: new Date(),
    });
  };

  test('Error si el monto es <= 0', async () => {
    const dto = { userId: 'user123', accountId: 'acc123', amount: 0 };
    
    try {
      await withdrawMoney.execute(dto);
      expect.fail('Debería haber lanzado un error');
    } catch (error: any) {
      assert(error).toBeInstanceOf(AppError);
      assert(error.code).toBeEqual('INVALID_AMOUNT');
    }
  });

  test('Error si la cuenta no existe', async () => {
    mockAccountRepo.findById.mockResolvedValue(null);
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    
    try {
      await withdrawMoney.execute(dto);
      expect.fail('Debería haber lanzado un error');
    } catch (error: any) {
      assert(error).toBeInstanceOf(AppError);
      assert(error.code).toBeEqual('ACCOUNT_NOT_FOUND');
    }
  });

  test('Error si la cuenta no pertenece al usuario', async () => {
    const account = createMockAccount(100, AccountStatus.ACTIVA, 'otherUser');
    mockAccountRepo.findById.mockResolvedValue(account);
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    
    try {
      await withdrawMoney.execute(dto);
      expect.fail('Debería haber lanzado un error');
    } catch (error: any) {
      assert(error).toBeInstanceOf(AppError);
      assert(error.code).toBeEqual('FORBIDDEN');
    }
  });

  test('Error si la cuenta no está activa', async () => {
    const account = createMockAccount(100, AccountStatus.BLOQUEADA, 'user123');
    mockAccountRepo.findById.mockResolvedValue(account);
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    
    try {
      await withdrawMoney.execute(dto);
      expect.fail('Debería haber lanzado un error');
    } catch (error: any) {
      assert(error).toBeInstanceOf(AppError);
      assert(error.code).toBeEqual('ACCOUNT_INACTIVE');
    }
  });

  test('Error si no hay fondos suficientes', async () => {
    const account = createMockAccount(30, AccountStatus.ACTIVA, 'user123');
    mockAccountRepo.findById.mockResolvedValue(account);
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    
    try {
      await withdrawMoney.execute(dto);
      expect.fail('Debería haber lanzado un error');
    } catch (error: any) {
      assert(error).toBeInstanceOf(AppError);
      assert(error.code).toBeEqual('INSUFFICIENT_FUNDS');
    }
  });

  test('Retiro exitoso - actualiza balance y envía notificación', async () => {
    const account = createMockAccount(100, AccountStatus.ACTIVA, 'user123');
    const updatedAccount = createMockAccount(50, AccountStatus.ACTIVA, 'user123');
    
    mockAccountRepo.findById.mockResolvedValue(account);
    mockAccountRepo.updateBalance.mockResolvedValue(updatedAccount);
    
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    const result = await withdrawMoney.execute(dto);
    
    assert(result.balance).toBeEqual(50);
    expect(mockAccountRepo.updateBalance).toHaveBeenCalledWith('acc123', 50);
    expect(mockNotificationRepo.save).toHaveBeenCalled();
  });

  test('Retiro exitoso sin repositorio de notificaciones', async () => {
    const withdrawMoneySinNotif = new WithdrawMoney(mockAccountRepo);
    const account = createMockAccount(100, AccountStatus.ACTIVA, 'user123');
    const updatedAccount = createMockAccount(50, AccountStatus.ACTIVA, 'user123');
    
    mockAccountRepo.findById.mockResolvedValue(account);
    mockAccountRepo.updateBalance.mockResolvedValue(updatedAccount);
    
    const dto = { userId: 'user123', accountId: 'acc123', amount: 50 };
    const result = await withdrawMoneySinNotif.execute(dto);
    
    assert(result.balance).toBeEqual(50);
    expect(mockNotificationRepo.save).not.toHaveBeenCalled();
  });
});
