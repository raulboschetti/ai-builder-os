import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  /**
   * Coste del algoritmo bcrypt.
   * 12 es un buen equilibrio entre seguridad y rendimiento.
   */
  private readonly saltRounds = 12;

  /**
   * Genera el hash de una contraseña.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Comprueba si una contraseña coincide con su hash.
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}