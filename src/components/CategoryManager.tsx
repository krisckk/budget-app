import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { v4 as uuid } from 'uuid';
import {
  setAll,
  addOne,
  updateOne,
  removeOne,
  reorder,
  Category,
} from '../features/categories/categoriesSlice';
import { db } from '../db';
import { setAll as setTransactions } from '../features/transactions/transactionsSlice';
import { 
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from 'react-icons/fa';

function SortableCategoryItem({
  cat,
  index,
  onEdit,
  onDelete,
}: {
  cat: Category;
  index: number;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = (Icons as any)[cat.icon];

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="category-list-item"
    >
      {/* only this drag-handle has the listeners */}
        <span 
            {...listeners} 
            className="drag-handle"
            title="Drag to reorder"
        >
            ☰
        </span>
        <span style={{ color: cat.color, fontSize: '1.2rem' }}>
            <IconComponent />
        </span>
        <span className="category-name">{cat.name}</span>
        <button onClick={() => onEdit(cat)}>✎</button>
        <button onClick={() => onDelete(cat.id)}>🗑️</button>
    </li>
  );
}

export default function CategoryManager() {
    const cats = useSelector((s: RootState) => s.categories.list);
    const dispatch = useDispatch();

    // Load existing categories
    useEffect(() => {
        db.categories.toArray().then(arr => dispatch(setAll(arr)));
    }, [dispatch]);

    // Form state
    const [name, setName] = useState('');
    const [icon, setIcon] = useState<keyof typeof Icons>('FaTag');
    const [color, setColor] = useState('#4caf50');
    const [editId, setEditId] = useState<string | null>(null);

    // Toggle state for showing/hiding the list
    const [open, setOpen] = useState(false);

    const resetForm = () => {
        setName('');
        setIcon('FaTag');
        setColor('#4caf50');
        setEditId(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (editId) {
        const existing = cats.find(c => c.id === editId)!;
        const updated: Category = {
            ...existing,
            name: name.trim(),
            icon,
            color,
        };
        await db.categories.put(updated);
        dispatch(updateOne(updated));
        } else {
        const order = cats.length;
        const cat: Category = {
            id: uuid(),
            name: name.trim(),
            icon,
            color,
            order,
        };
        await db.categories.add(cat);
        dispatch(addOne(cat));
        }
        resetForm();
    };

    const onDelete = async (id: string) => {
        // 1. Find the category name before removing it
        const toDelete = cats.find(c => c.id === id);
        if (!toDelete) return;
    
        // 2. Remove category
        await db.categories.delete(id);
        dispatch(removeOne(id));
    
        // 3. Cascade-delete related transactions
        await db.transactions
        .where('category')
        .equals(toDelete.name)
        .delete();
    
        // 4. Reload transactions into Redux
        const remaining = await db.transactions.toArray();
        dispatch(setTransactions(remaining));
    
        // 5. Reset the form if we were editing this category
        if (editId === id) resetForm();
    };

  const onEdit = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setIcon(c.icon as keyof typeof Icons);
    setColor(c.color);
  };

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cats.findIndex(c => c.id === active.id);
      const newIndex = cats.findIndex(c => c.id === over.id);
      const newOrder = arrayMove(cats, oldIndex, newIndex).map((c, i) => ({
        ...c,
        order: i,
      }));
      // persist
      await Promise.all(newOrder.map(c => db.categories.put(c)));
      dispatch(reorder(newOrder));
    }
  };

  return (
    <div className="category-manager">
        <h2>Manage Categories</h2>
        <button
            className="toggle-button"
            onClick={() => setOpen(o => !o)}
        >
            {open ? 'Hide Categories ▲' : 'Show Categories ▼'}
        </button>
        <form onSubmit={onSubmit} className="category-form">
            <input
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            />
            <select
            value={icon}
            onChange={e => setIcon(e.target.value as any)}
            >
            {Object.keys(Icons).map(key => (
                <option key={key} value={key}>
                {key.replace(/^Fa/, '')}
                </option>
            ))}
            </select>
            <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            />
            <button type="submit">{editId ? 'Save' : 'Add'}</button>
            {editId && (
            <button type="button" onClick={resetForm}>
                Cancel
            </button>
            )}
        </form>
        {open && (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                items={cats.map(c => c.id)}
                strategy={verticalListSortingStrategy}
                >
                    <ul className="category-list">
                        {cats.map((c, i) => (
                        <SortableCategoryItem
                            key={c.id}
                            cat={c}
                            index={i}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        )}
    </div>
  );
}
