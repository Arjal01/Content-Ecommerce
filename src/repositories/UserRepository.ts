import { prisma } from '@/lib/db'
import { Role, User } from '@prisma/client'

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  async create(data: Partial<User>) {
    return prisma.user.create({
      data: {
        email: data.email!,
        password: data.password!,
        role: data.role as Role || 'USER',
      }
    })
  }
}
