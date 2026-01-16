import { hashPassword, comparePassword, generateToken } from '@/lib/auth'
import { UserRepository } from '@/repositories/UserRepository'

export class AuthService {
  private userRepository = new UserRepository()

  async register(email: string, password: string, role: 'ADMIN' | 'USER' | 'VENDOR' = 'USER') {
    const existing = await this.userRepository.findByEmail(email)
    if (existing) throw new Error('User already exists')

    const hashed = await hashPassword(password)
    const user = await this.userRepository.create({ email, password: hashed, role })

    const token = generateToken({ userId: user.id, role: user.role })
    return { user, token }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) throw new Error('Invalid credentials')

    const valid = await comparePassword(password, user.password)
    if (!valid) throw new Error('Invalid credentials')

    const token = generateToken({ userId: user.id, role: user.role })
    return { user, token }
  }
}
