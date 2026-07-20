# AI Builder OS

AI Builder OS es una plataforma SaaS impulsada por Inteligencia Artificial para crear aplicaciones empresariales de forma visual.

> Nombre de trabajo interno — el nombre de cara al público aún está por decidir.

## Estado del proyecto

🚧 En desarrollo

## Arquitectura

Multi-tenant desde el core, aislamiento estricto entre organizaciones:

```
Organization (tenant)
 └─ Membership (usuario + rol: OWNER / ADMIN / MEMBER)
 └─ Workspace
     └─ Project
         - businessVertical (texto libre: dentista, fontanero, seguros...)
         - description (contexto de negocio, entrada para la IA)
         - buildStage: INTAKE → ARCHITECTURE_GENERATED → BUILDING → DEPLOYED
```

Cada usuario se crea junto con su organización propietaria en una única transacción — nunca existe un usuario sin organización. El JWT lleva `organizationId` y `role`, y toda consulta de negocio va filtrada por esa organización.

## Stack tecnológico

- Turborepo · PNPM
- API: NestJS + Prisma 7 (adapter `@prisma/adapter-pg`) + PostgreSQL 17
- Web: Next.js + TypeScript + React
- Auth: JWT (access + refresh), passwords con bcrypt

## Licencia

Privado © AI Builder OS