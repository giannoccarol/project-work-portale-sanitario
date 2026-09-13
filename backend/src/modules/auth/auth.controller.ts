import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { ChangePasswordBody, LoginBody, RegisterPatientBody } from '../../validation/dtos';

const authService = new AuthService();

export const login = [
  validateBody(LoginBody),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  }),
];

export const register = [
  validateBody(RegisterPatientBody),
  asyncHandler(async (req, res) => {
    const result = await authService.registerPatient(req.body);
    res.status(201).json(result);
  }),
];

export const me = [
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.me(req.user!.sub);
    res.json(user);
  }),
];

export const changePassword = [
  authenticate,
  validateBody(ChangePasswordBody),
  asyncHandler(async (req, res) => {
    await authService.changePassword(req.user!.sub, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Password aggiornata' });
  }),
];
