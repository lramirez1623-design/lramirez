# FinanceHub Luis

Aplicación PWA preparada con Next.js, React, Tailwind y un adaptador de Supabase.

## Arranque local

1. Copie `.env.example` a `.env.local` y agregue sus credenciales de Supabase si desea persistencia en la nube.
2. Instale dependencias: `pnpm install`.
3. Ejecute: `pnpm dev`.
4. Abra `http://localhost:3000`.

Los datos semilla se guardan en el navegador para que pueda iniciar de inmediato. Para habilitar el almacenamiento en Supabase, cree un proyecto, ejecute `supabase/schema.sql` en el SQL Editor y agregue las variables de entorno. El esquema incluye seguridad por usuario (RLS).

## Incluye

- Panel con patrimonio, liquidez, flujo y deudas.
- Registro editable de ingresos/gastos y exportación compatible con Excel.
- Seguimiento de deudas, Uber, vehículos, Neftalí y ahorro.
- Simulador de Creta, alquiler del Elantra, aguinaldo y abonos.
- Proyección de deuda a 12 meses y reporte imprimible a PDF.
