import ItemForm from "@/components/admin/ItemForm";

export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-olive">دورة جديدة</h1>
      <div className="mt-6 rounded-2xl border border-olive/10 bg-white p-6 shadow-sm sm:p-8">
        <ItemForm />
      </div>
    </div>
  );
}
