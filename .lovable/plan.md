

## Plan: Planes de usuario + Exámenes por módulo

Dos features nuevas en el panel admin y en el flujo del alumno.

---

### 1. Planes de usuario (Básico / Pro / Premium)

**Objetivo:** El admin asigna un plan a cada alumno desde la pestaña "Alumnos". El plan condiciona qué cursos/módulos puede ver.

**Backend (migración):**
- Nuevo enum `user_plan` con valores: `basico`, `pro`, `premium`.
- Nueva tabla `user_plans` (`user_id` PK, `plan user_plan`, `assigned_at`, `assigned_by`).
- RLS: admin gestiona todo; el usuario lee solo el suyo.
- Añadir columna `required_plan user_plan` a `courses` (nullable = abierto a todos).

**Admin UI (`Admin.tsx` → StudentsPanel):**
- Nueva columna "Plan" con `<select>` inline (Básico / Pro / Premium / Sin plan).
- Al cambiar, upsert en `user_plans` y refetch.

**Alumno (`Dashboard.tsx`):**
- Filtrar `tree` por cursos cuyo `required_plan` sea null o coincida con el plan del usuario.
- Si el curso requiere plan superior, mostrar tarjeta bloqueada "Disponible en plan Pro".

---

### 2. Exámenes por módulo

**Objetivo:** Cada módulo puede tener un examen. El alumno lo desbloquea al completar todas las lecciones del módulo. Aprobar es requisito para considerar el módulo "superado" y eventualmente emitir certificado.

**Backend (migración):**
- Tabla `exams`: `id`, `module_id` (único, 1 examen por módulo), `title` (auto: "Examen 1", "Examen 2"…), `passing_score` (default 70), `created_at`.
- Tabla `exam_questions`: `id`, `exam_id`, `question`, `options` (jsonb array de strings), `correct_index` (int), `order`.
- Tabla `exam_attempts`: `id`, `user_id`, `exam_id`, `score`, `passed` (bool), `answers` (jsonb), `completed_at`.
- RLS: admin gestiona exams + questions; alumnos leen exams/questions de cursos a los que tienen acceso; alumnos insertan/leen sus propios attempts.
- Numeración "Examen N": calculada en cliente según orden del módulo dentro del curso (Módulo 1 → Examen 1).

**Admin UI (`Admin.tsx` → ContentPanel):**
- Dentro de cada `ModuleRow` expandido, debajo de las lecciones añadir bloque "Examen del módulo":
  - Si no existe → botón "Crear examen".
  - Si existe → lista de preguntas editables (texto + 4 opciones + radio para correcta) con añadir/eliminar.
  - Campo `passing_score`.
- Etiqueta visible: `Módulo {N} · Examen {N}` (calculada por orden).

**Alumno (`LmsSidebar.tsx` + nuevo `ExamView.tsx`):**
- En el sidebar, después de las lecciones de cada módulo, mostrar entrada "📝 Examen {N}":
  - Bloqueada (gris + candado) hasta completar todas las lecciones del módulo.
  - Marcada ✓ si ya está aprobado.
- Nueva ruta interna `?exam=<id>` en Dashboard que renderiza `ExamView`:
  - Lista preguntas + opciones (radio).
  - Botón "Enviar". Calcula score, inserta `exam_attempts`, muestra resultado y botón "Volver" o "Reintentar".
- Lógica certificado (`useCertificate`): solo permitir generar si todos los exámenes del curso están aprobados (además del 100% lecciones).

---

### Detalles técnicos

**Archivos nuevos:**
- `src/components/lms/ExamView.tsx`
- `src/hooks/useExam.ts` (fetch examen + preguntas + submit attempt)
- `src/hooks/useUserPlan.ts` (plan del usuario actual)
- `src/components/admin/ExamEditor.tsx` (CRUD preguntas dentro de ContentPanel)

**Archivos editados:**
- `src/pages/Admin.tsx` → columna Plan en StudentsPanel + ExamEditor en ModuleRow
- `src/hooks/useAdminData.ts` → incluir exams en el árbol
- `src/hooks/useAdminStudents.ts` → join con `user_plans`
- `src/hooks/useCourseData.ts` → filtrar por plan del usuario, incluir exams + intentos
- `src/components/lms/LmsSidebar.tsx` → entrada examen por módulo
- `src/pages/Dashboard.tsx` → render `ExamView` cuando `?exam=`
- `src/hooks/useCertificate.ts` → bloquear si exámenes pendientes

**Migración SQL:** 1 sola migración con enum `user_plan`, tablas `user_plans`, `exams`, `exam_questions`, `exam_attempts`, columna `courses.required_plan`, todas las RLS.

**Orden de implementación:**
1. Migración DB (todas las tablas + RLS).
2. Planes: hook + columna admin + filtrado dashboard.
3. Exámenes: editor admin.
4. Exámenes: vista alumno + integración sidebar.
5. Bloqueo certificado por exámenes.
6. Prueba end-to-end como admin y como alumno.

