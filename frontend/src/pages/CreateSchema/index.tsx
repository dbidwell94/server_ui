import { useState } from "react";
import PageLayout from "../../components/PageLayout";
import AddFieldButton from "./AddFieldButton";
import FieldEditorModal from "./FieldEditorModal";
import FieldDisplay from "./FieldDisplay";
import type { DynamicField } from "./types";

export default function CreateSchema() {
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddField = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveField = (field: DynamicField) => {
    if (editingIndex !== null) {
      setFields((prev) => {
        const updated = [...prev];
        updated[editingIndex] = field;
        return updated;
      });
    } else {
      setFields((prev) => [...prev, field]);
    }
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setFields((prev) => {
      const newFields = [...prev];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(dropIndex, 0, draggedField);
      return newFields;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <PageLayout showFooter>
      <div className="flex justify-center min-h-screen">
        <div className="max-w-7xl px-3 py-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {fields.map((field, index) => (
              <FieldDisplay
                key={field.displayName ?? field.name}
                field={field}
                onDelete={() => handleDeleteField(index)}
                onEdit={() => handleEditField(index)}
                isDragging={draggedIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              />
            ))}

            {/* Add new field button */}
            <AddFieldButton onClick={handleAddField} />
          </div>
        </div>
      </div>

      <FieldEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSave={handleSaveField}
        initialField={editingIndex !== null ? fields[editingIndex] : undefined}
      />
    </PageLayout>
  );
}
