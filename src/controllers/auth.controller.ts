import { AuthenticationService } from '../services/Authentication.service';
import { Request, Response } from 'express';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';
import { UserService } from '../services/user.service';
export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
  ) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required', {
        email: !email,
        password: !password,
      });
    }
    try {
      const user = await this.userService.validateUser(email, password);
      this.authService.persistAuthentication(res, {
        userId: user.getId(),
        role: user.getRole(),
      });
      res.status(200).json({
        message: 'Login successful',
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === 'Invalid email or password'
      ) {
        throw new BadRequestException('Invalid email or password');
      }
      throw new Error('An error occurred during login', { cause: error });
    }
  }
  async logout(req: Request, res: Response) {
    this.authService.clearTokens(res);
    res.status(200).json({
      message: 'Logout successful',
    });
  }
}
