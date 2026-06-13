'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole, Generator } from '@/lib/types/database'

export interface AdminState {
  error?: string
  success?: string
}

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if ((roleData as UserRole | null)?.role !== 'super_admin') return null
  return user
}

// ── Create user (super_admin or generator_admin) ─────────────────
export async function createUserAction(
  _prevState: AdminState | null,
  formData: FormData
): Promise<AdminState | null> {
  const caller = await assertSuperAdmin()
  if (!caller) return { error: 'غير مصرح' }

  const role = formData.get('role') as string
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
  if (password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  if (!['super_admin', 'generator_admin'].includes(role)) return { error: 'الدور غير صالح' }

  const adminClient = createAdminClient()

  const { data: newUser, error: userError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (userError || !newUser.user) {
    return { error: userError?.message ?? 'فشل إنشاء المستخدم' }
  }

  if (role === 'super_admin') {
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role: 'super_admin' } as Record<string, unknown>)

    if (roleError) {
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return { error: 'فشل تعيين الدور' }
    }

    revalidatePath('/admin/users')
    return { success: `تم إنشاء حساب المشرف العام ${email} بنجاح` }
  }

  // generator_admin
  const generatorName = (formData.get('generator_name') as string)?.trim()
  const amperePrice = parseFloat(formData.get('ampere_price') as string)

  if (!generatorName) {
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return { error: 'اسم المولدة مطلوب' }
  }
  if (isNaN(amperePrice) || amperePrice < 0) {
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return { error: 'سعر الأمبير غير صالح' }
  }

  const { data: genData, error: genError } = await adminClient
    .from('generators')
    .insert({ name: generatorName, ampere_price: amperePrice } as Record<string, unknown>)
    .select()
    .single()

  if (genError || !genData) {
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return { error: 'فشل إنشاء المولدة' }
  }

  const generator = genData as Generator

  const { error: roleError } = await adminClient
    .from('user_roles')
    .insert({
      user_id: newUser.user.id,
      role: 'generator_admin',
      generator_id: generator.id,
    } as Record<string, unknown>)

  if (roleError) {
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    await adminClient.from('generators').delete().eq('id', generator.id)
    return { error: 'فشل تعيين الدور' }
  }

  revalidatePath('/admin/users')
  return { success: `تم إنشاء حساب ${email} مع مولدة "${generatorName}" بنجاح` }
}

// ── Delete user ───────────────────────────────────────────────────
export async function deleteUserAction(userId: string): Promise<{ error?: string }> {
  const caller = await assertSuperAdmin()
  if (!caller) return { error: 'غير مصرح' }
  if (caller.id === userId) return { error: 'لا يمكنك حذف حسابك الخاص' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return {}
}

// ── Update generator ampere price (super admin or generator admin) ─
export async function updateAmperePriceAction(
  _prevState: AdminState | null,
  formData: FormData
): Promise<AdminState | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('generator_id, role')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null
  if (!userRole?.generator_id) return { error: 'لا توجد مولدة مرتبطة بحسابك' }

  const amperePrice = parseFloat(formData.get('ampere_price') as string)
  if (isNaN(amperePrice) || amperePrice < 0) return { error: 'سعر الأمبير غير صالح' }

  const { error } = await supabase
    .from('generators')
    .update({ ampere_price: amperePrice } as Record<string, unknown>)
    .eq('id', userRole.generator_id)

  if (error) return { error: 'فشل تحديث السعر' }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/subscribers')
  return { success: 'تم تحديث سعر الأمبير بنجاح' }
}

// ── Super admin: update any generator's price ────────────────────
export async function updateAnyGeneratorPriceAction(
  _prevState: AdminState | null,
  formData: FormData
): Promise<AdminState | null> {
  const caller = await assertSuperAdmin()
  if (!caller) return { error: 'غير مصرح' }

  const generatorId = formData.get('generator_id') as string
  const amperePrice = parseFloat(formData.get('ampere_price') as string)

  if (!generatorId) return { error: 'المولدة غير محددة' }
  if (isNaN(amperePrice) || amperePrice < 0) return { error: 'سعر الأمبير غير صالح' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('generators')
    .update({ ampere_price: amperePrice } as Record<string, unknown>)
    .eq('id', generatorId)

  if (error) return { error: 'فشل تحديث السعر' }

  revalidatePath('/admin/users')
  return { success: 'تم تحديث السعر بنجاح' }
}
