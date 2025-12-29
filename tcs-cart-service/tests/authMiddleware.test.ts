/// <reference types="jest" />
import { authMiddleware } from '../src/middleware/auth';
import { ERROR_CODES, MESSAGES } from '../src/constants';
import type { Request, Response } from 'express';

describe('authMiddleware', () => {
  let req: Partial<Request> & { headers?: Record<string, string | undefined> };
  let res: Partial<Response> & { status?: jest.Mock; json?: jest.Mock };
  let next: jest.Mock;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    next = jest.fn();
    statusMock = jest.fn(() => res as Response);
    jsonMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
    };
    req = { headers: {} };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('skips checks in test environment', () => {
    process.env.NODE_ENV = 'test';
    authMiddleware(req as Request, res as Response, next as any);
    expect(next).toHaveBeenCalled();
  });

  it('allows request when token matches', () => {
    process.env.NODE_ENV = 'development';
    req!.headers!['x-api-key'] = 'TCS2026!';
    authMiddleware(req as Request, res as Response, next as any);
    expect(next).toHaveBeenCalled();
  });

  it('rejects request when token missing or invalid', () => {
    process.env.NODE_ENV = 'development';
    authMiddleware(req as Request, res as Response, next as any);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: { code: ERROR_CODES.UNAUTHORIZED, message: MESSAGES.INVALID_API_TOKEN } });
  });
});