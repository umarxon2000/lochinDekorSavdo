const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

let query = supabase.from('sales').select('*, profiles(nickname)');

if (profile?.role === 'seller') {
  // Sotuvchi faqat o'zini ko'radi
  query = query.eq('seller_id', user?.id);
} else {
  // Admin hammani ko'radi (Guruhlash mantiqi yuqoridagi koddek)
}